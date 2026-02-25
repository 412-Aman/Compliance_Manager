import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.customer import Customer
from src.models.transaction import Transaction
from src.models.alert import Alert
from src.integrations.llm.client import LLMClient
from src.services.audit import AuditService

logger = logging.getLogger(__name__)

class AnomalyScorer:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.llm = LLMClient()
        self.audit = AuditService(db)

    async def score_transaction(self, tx: Transaction) -> Optional[Alert]:
        if not tx.customer_id:
            return None

        # 1. Fetch historical context
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.customer_id == tx.customer_id)
            .where(Transaction.id != tx.id)
            .order_by(Transaction.block_time.desc())
            .limit(100)
        )
        history = result.scalars().all()
        
        if not history:
            return None

        # 2. Heuristic checks
        scores = []
        drivers = []
        
        # Velocity Check
        recent_txs = [t for t in history if (tx.block_time - t.block_time).total_seconds() < 3600]
        # Baseline hourly rate from last 7d (simple mean for now)
        lambda_rate = len(history) / (7 * 24) if history else 0
        severity_velocity = min(1.0, len(recent_txs) / (lambda_rate + 5.0)) # Smoothing
        
        if severity_velocity > 0.5:
            scores.append(severity_velocity * 100)
            drivers.append({
                "feature": "velocity_1h",
                "observed": f"{len(recent_txs)} txs",
                "expected": f"~{lambda_rate:.1f} txs/h",
                "delta": f"+{len(recent_txs) - lambda_rate:.1f}",
                "severity": float(severity_velocity),
                "evidence": f"Transaction frequency is elevated ({len(recent_txs)} in 1h) compared to baseline."
            })
            
        # Amount Check (Robust Z-Score using MAD as per docs/04)
        amounts = [float(t.amount_usd or 0) for t in history]
        median_amt = np.median(amounts)
        mad = np.median([abs(x - median_amt) for x in amounts])
        current_amt = float(tx.amount_usd or 0)
        
        # Avoid division by zero
        epsilon = 0.01
        z = 0.6745 * (current_amt - median_amt) / (mad + epsilon)
        
        # Sigmoid mapping: s = 1 / (1 + exp(-z/k)) where k=3
        severity_amount = 1 / (1 + np.exp(-z / 3.0))
        
        if severity_amount > 0.7:
            scores.append(severity_amount * 100)
            drivers.append({
                "feature": "amount_spike",
                "observed": f"${current_amt:,.2f}",
                "expected": f"median ${median_amt:,.2f}",
                "delta": f"{((current_amt/median_amt)-1)*100:+.1f}%" if median_amt > 0 else "N/A",
                "severity": float(severity_amount),
                "evidence": f"Transaction amount is significantly higher than historical median (Robust Z={z:.2f})."
            })

        if not scores:
            return None

        # 3. Final Scoring & LLM Analysis
        final_score = min(100.0, max(scores))
        
        # Calculate heuristic confidence based on how many rules triggered
        base_confidence = 0.5 + (len(scores) * 0.1)
        base_confidence = min(0.95, base_confidence)

        analysis = await self.llm.generate_analysis(
            f"Transaction Hash: {tx.tx_hash}\nDrivers: {drivers}"
        )
        
        if analysis:
            explanation = analysis.get("explanation")
            recommendations = analysis.get("recommendations")
            # If AI provides a score/confidence, we could use it here
            confidence = float(analysis.get("confidence", base_confidence))
        else:
            # DYNAMIC FALLBACK: Construct explanation from drivers
            primary_driver = drivers[0]["evidence"]
            explanation = f"Heuristic detection: {primary_driver}"
            if len(drivers) > 1:
                explanation += f" Also triggered {len(drivers)-1} other risk indicators."
            
            recommendations = "Initiate enhanced due diligence (EDD) and monitor subsequent transactions for this entity."
            if any(d["feature"] == "amount_spike" for d in drivers):
                recommendations = "Freeze funds pending source of wealth (SOW) verification and identity confirmation."
            
            confidence = base_confidence

        # 4. Create Alert
        alert = Alert(
            customer_id=tx.customer_id,
            alert_type="BEHAVIORAL_ANOMALY",
            risk_score=final_score,
            confidence=confidence,
            status="OPEN",
            drivers_json=drivers,
            explanation_nl=explanation,
            recommendations_nl=recommendations
        )
        self.db.add(alert)
        await self.db.commit()
        
        # 5. Log & Notify
        await self.audit.log_event("alert.created", {
            "alert_id": str(alert.id),
            "customer_id": str(tx.customer_id),
            "risk_score": final_score
        })
        
        return alert
