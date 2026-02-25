from typing import List
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from src.db.session import get_db
from src.models.audit_event import AuditEvent

router = APIRouter()

class AuditEventRead(BaseModel):
    id: UUID
    event_type: str
    payload_json: dict
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditEventRead])
async def get_audit_events(limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit)
    )
    return result.scalars().all()
