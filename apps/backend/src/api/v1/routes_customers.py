from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from src.db.session import get_db
from src.services.customers import CustomerService
from src.integrations.chain.evm_provider import EVMProvider

router = APIRouter()

class DeclaredProfile(BaseModel):
    country: str
    income_band: str  # LOW|MID|HIGH|HNW
    occupation: str
    source_of_funds: str
    expected_monthly_volume_usd: float
    risk_appetite: str  # LOW|MED|HIGH

class CustomerCreate(BaseModel):
    label: str
    chain: str
    address: str
    declared_profile: Optional[DeclaredProfile] = None

class CustomerRead(BaseModel):
    id: UUID
    label: str
    chain: str
    address: str
    declared_profile_json: dict
    created_at: datetime
    alert_count: int = 0
    transaction_count: int = 0
    
    class Config:
        from_attributes = True

@router.post("", response_model=CustomerRead)
async def create_customer(
    customer_in: CustomerCreate, 
    db: AsyncSession = Depends(get_db)
):
    provider = EVMProvider()
    try:
        checksummed_address = provider.to_checksum_address(customer_in.address)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid blockchain address")

    service = CustomerService(db)
    existing = await service.get_customer_by_address(checksummed_address)
    if existing:
        raise HTTPException(status_code=400, detail="Customer already exists")
    
    return await service.create_customer(
        label=customer_in.label,
        chain=customer_in.chain,
        address=checksummed_address,
        profile=customer_in.declared_profile.dict() if customer_in.declared_profile else {}
    )

@router.get("", response_model=List[CustomerRead])
async def list_customers(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    service = CustomerService(db)
    return await service.list_customers(skip=skip, limit=limit)

@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(
    customer_id: UUID, 
    db: AsyncSession = Depends(get_db)
):
    service = CustomerService(db)
    customer = await service.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.get("/{customer_id}/transactions")
async def get_customer_transactions(
    customer_id: UUID,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from src.models.transaction import Transaction
    
    result = await db.execute(
        select(Transaction)
        .where(Transaction.customer_id == customer_id)
        .order_by(Transaction.block_time.desc())
        .limit(limit)
    )
    transactions = result.scalars().all()
    
    return [
        {
            "id": str(t.id),
            "tx_hash": t.tx_hash,
            "direction": t.direction,
            "amount_usd": float(t.amount_usd) if t.amount_usd else 0,
            "asset": t.asset,
            "counterparty": t.counterparty,
            "block_time": t.block_time.isoformat() if t.block_time else None
        }
        for t in transactions
    ]

@router.get("/{customer_id}/stats")
async def get_customer_stats(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select, func
    from src.models.transaction import Transaction
    from src.models.alert import Alert
    from datetime import datetime, timedelta
    
    # Get transaction count
    tx_result = await db.execute(
        select(func.count(Transaction.id)).where(Transaction.customer_id == customer_id)
    )
    tx_count = tx_result.scalar() or 0
    
    # Get alert count
    alert_result = await db.execute(
        select(func.count(Alert.id)).where(Alert.customer_id == customer_id)
    )
    alert_count = alert_result.scalar() or 0
    
    # Get latest transaction time
    latest_tx = await db.execute(
        select(Transaction.block_time)
        .where(Transaction.customer_id == customer_id)
        .order_by(Transaction.block_time.desc())
        .limit(1)
    )
    last_activity = latest_tx.scalar()
    
    # Determine monitoring status
    if tx_count == 0:
        status = "PENDING"  # No transactions yet
    elif last_activity and (datetime.utcnow() - last_activity.replace(tzinfo=None)) < timedelta(hours=1):
        status = "ACTIVE"  # Recent activity
    else:
        status = "IDLE"  # No recent activity
    
    # Calculate risk level based on alerts
    if alert_count == 0:
        risk_level = "LOW"
    elif alert_count <= 3:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"
    
    return {
        "transaction_count": tx_count,
        "alert_count": alert_count,
        "last_activity": last_activity.isoformat() if last_activity else None,
        "monitoring_status": status,
        "risk_level": risk_level
    }
