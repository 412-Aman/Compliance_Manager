import asyncio
import numpy as np
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from src.services.anomalies.scoring import AnomalyScorer
from src.models.transaction import Transaction

async def test_scoring_logic_amount_spike():
    print("🧪 Running Scoring Logic Verification...")
    
    # Mock DB
    mock_db = AsyncMock()
    scorer = AnomalyScorer(mock_db)
    
    # Mock LLM and Audit
    scorer.llm = AsyncMock()
    scorer.llm.generate_explanation.return_value = "Mocked explanation"
    scorer.audit = AsyncMock()
    
    # 1. Setup history (normal transactions)
    # Median ~100
    mock_tx1 = MagicMock(spec=Transaction)
    mock_tx1.amount_usd = 100.0
    mock_tx1.block_time = datetime.now()
    
    mock_tx2 = MagicMock(spec=Transaction)
    mock_tx2.amount_usd = 110.0
    mock_tx2.block_time = datetime.now()
    
    mock_tx3 = MagicMock(spec=Transaction)
    mock_tx3.amount_usd = 90.0
    mock_tx3.block_time = datetime.now()
    
    history = [mock_tx1, mock_tx2, mock_tx3]
    
    # Mock the query result
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = history
    mock_db.execute.return_value = mock_result
    
    # 2. Test transaction (huge spike)
    test_tx = MagicMock(spec=Transaction)
    test_tx.customer_id = "uuid-123"
    test_tx.amount_usd = 5000.0
    test_tx.block_time = datetime.now()
    test_tx.tx_hash = "0xabc"
    test_tx.id = "tx-id-456"
    
    alert = await scorer.score_transaction(test_tx)
    
    # 3. Assertions
    try:
        assert alert is not None, "Alert should have been created"
        assert alert.risk_score > 90, f"Risk score should be high, got {alert.risk_score}"
        
        # Check drivers
        drivers = alert.drivers_json
        assert any(d['feature'] == 'amount_spike' for d in drivers), "Amount spike driver missing"
        
        # Check delta specifically
        spike_driver = next(d for d in drivers if d['feature'] == 'amount_spike')
        assert "delta" in spike_driver, "Delta field missing from driver"
        
        print("\n✅ Verification SUCCESS: Robust Z-score detected the amount spike with high severity.")
        print(f"📊 Driver Delta: {spike_driver['delta']}")
        print(f"🎯 Risk Score: {alert.risk_score:.2f}")
    except AssertionError as e:
        print(f"\n❌ Verification FAILED: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(test_scoring_logic_amount_spike())
