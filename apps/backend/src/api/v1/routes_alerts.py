from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from src.db.session import get_db
from src.services.alerts import AlertService

router = APIRouter()

class FeedbackCreate(BaseModel):
    label: str  # TRUE_POSITIVE|FALSE_POSITIVE|LEGITIMATE_CHANGE
    analyst_note: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str  # OPEN|ESCALATED|CLOSED

class AlertRead(BaseModel):
    id: UUID
    customer_id: UUID
    customer_label: Optional[str] = None
    customer_address: Optional[str] = None
    alert_type: str
    risk_score: float
    confidence: float
    status: str
    drivers_json: list
    explanation_nl: Optional[str]
    recommendations_nl: Optional[str]
    created_at: datetime

    @classmethod
    def from_orm_with_customer(cls, alert):
        return cls(
            id=alert.id,
            customer_id=alert.customer_id,
            customer_label=alert.customer.label if alert.customer else "Unknown",
            customer_address=alert.customer.address if alert.customer else "Unknown",
            alert_type=alert.alert_type,
            risk_score=alert.risk_score,
            confidence=alert.confidence,
            status=alert.status,
            drivers_json=alert.drivers_json,
            explanation_nl=alert.explanation_nl,
            recommendations_nl=alert.recommendations_nl,
            created_at=alert.created_at
        )

    class Config:
        from_attributes = True

@router.get("", response_model=List[AlertRead])
async def list_alerts(
    status: Optional[str] = None, 
    limit: int = 50, 
    db: AsyncSession = Depends(get_db)
):
    service = AlertService(db)
    alerts = await service.list_alerts(status=status, limit=limit)
    return [AlertRead.from_orm_with_customer(a) for a in alerts]

@router.get("/{alert_id}", response_model=AlertRead)
async def get_alert(
    alert_id: UUID, 
    db: AsyncSession = Depends(get_db)
):
    service = AlertService(db)
    alert = await service.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return AlertRead.from_orm_with_customer(alert)

@router.post("/{alert_id}/feedback")
async def submit_feedback(
    alert_id: UUID, 
    feedback_in: FeedbackCreate, 
    db: AsyncSession = Depends(get_db)
):
    service = AlertService(db)
    return await service.submit_feedback(
        alert_id=alert_id,
        label=feedback_in.label,
        note=feedback_in.analyst_note
    )

@router.post("/{alert_id}/status")
async def update_alert_status(
    alert_id: UUID, 
    status_update: StatusUpdate, 
    db: AsyncSession = Depends(get_db)
):
    service = AlertService(db)
    alert = await service.update_alert_status(alert_id, status_update.status)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return AlertRead.from_orm_with_customer(alert)
