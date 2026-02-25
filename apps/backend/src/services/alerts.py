from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.alert import Alert
from src.models.feedback import Feedback
from src.models.customer import Customer
from src.services.audit import AuditService

class AlertService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.audit = AuditService(db)

    async def list_alerts(self, status: Optional[str] = None, limit: int = 50) -> List[Alert]:
        query = select(Alert).options(joinedload(Alert.customer)).order_by(Alert.created_at.desc())
        if status:
            query = query.where(Alert.status == status)
        
        result = await self.db.execute(query.limit(limit))
        return result.scalars().all()

    async def get_alert(self, alert_id: UUID) -> Optional[Alert]:
        result = await self.db.execute(
            select(Alert).options(joinedload(Alert.customer)).where(Alert.id == alert_id)
        )
        return result.scalars().first()

    async def update_alert_status(self, alert_id: UUID, status: str) -> Optional[Alert]:
        alert = await self.get_alert(alert_id)
        if alert:
            alert.status = status
            await self.db.commit()
            await self.db.refresh(alert)
            
            await self.audit.log_event("alert.status_updated", {
                "alert_id": str(alert_id),
                "new_status": status
            })
        return alert

    async def submit_feedback(self, alert_id: UUID, label: str, note: Optional[str] = None) -> Feedback:
        feedback = Feedback(
            alert_id=alert_id,
            label=label,
            analyst_note=note
        )
        self.db.add(feedback)
        await self.db.commit()
        await self.db.refresh(feedback)
        
        await self.audit.log_event("alert.feedback_submitted", {
            "alert_id": str(alert_id),
            "label": label,
            "note": note
        })
        
        return feedback
