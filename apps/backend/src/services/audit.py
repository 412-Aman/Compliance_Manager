from sqlalchemy.ext.asyncio import AsyncSession
from src.models.audit_event import AuditEvent
from src.services.websocket import manager
import logging
import json

logger = logging.getLogger(__name__)

class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_event(self, event_type: str, payload: dict):
        try:
            event = AuditEvent(
                event_type=event_type,
                payload_json=payload
            )
            self.db.add(event)
            await self.db.commit()
            
            # Broadcast to UI
            await manager.emit_event(event_type, payload)
            logger.info(f"Audit event logged: {event_type}")
        except Exception as e:
            logger.error(f"Audit logging error: {e}")
