from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from src.db.session import get_db
from src.models.regulatory_doc import RegulatoryDoc
from src.services.regulatory.ingest import poll_regulatory_sources
from src.services.regulatory.impact import ImpactSimulationService

router = APIRouter()

class RegulatoryDocRead(BaseModel):
    id: UUID
    source: str
    jurisdiction: str
    url: str
    fetched_at: datetime
    raw_text: Optional[str]
    parsed_json: Optional[dict]
    
    class Config:
        from_attributes = True

class ImpactSimulationRequest(BaseModel):
    rule_definition: dict

@router.post("/poll")
async def trigger_poll(db: AsyncSession = Depends(get_db)):
    await poll_regulatory_sources(db)
    return {"message": "Polling initiated"}

@router.get("/updates", response_model=List[RegulatoryDocRead])
async def list_updates(limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RegulatoryDoc).order_by(RegulatoryDoc.fetched_at.desc()).limit(limit)
    )
    return result.scalars().all()

@router.get("/updates/{doc_id}", response_model=RegulatoryDocRead)
async def get_update(doc_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RegulatoryDoc).where(RegulatoryDoc.id == doc_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Update not found")
    return doc

@router.post("/simulate-impact")
async def simulate_impact(
    req: ImpactSimulationRequest, 
    db: AsyncSession = Depends(get_db)
):
    service = ImpactSimulationService(db)
    return await service.simulate_rule_impact(req.rule_definition)

@router.get("/recommendations")
async def get_regulatory_recommendations():
    """
    Returns rule recommendations with detailed impact simulation data (mocked for demo excellence).
    """
    return {
        "recommendations": [
            {
                "id": "rec1",
                "title": "Enhanced Monitoring for Virtual Asset Transfers",
                "description": "Implement additional scrutiny for VASP transactions exceeding 1000 USD based on FATF guidance",
                "priority": "HIGH",
                "jurisdiction": "Global",
                "proposed_rule": {
                    "threshold_usd": 1000,
                    "action": "ENHANCED_MONITORING",
                    "required_fields": ["source_of_funds", "counterparty_verification"]
                },
                "impact_simulation": {
                    "methodology": "Analyzed last 30 days of transaction data",
                    "projected_alert_increase": "+18%",
                    "by_segment": { "HNW": "+12%", "MID": "+22%", "LOW": "+15%" },
                    "estimated_false_positives": "5-8%",
                    "risk_areas": [ "Student wallets with exchange withdrawals may generate false positives" ]
                },
                "confidence": 0.87
            }
        ]
    }
