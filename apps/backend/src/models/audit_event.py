
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from ..db.types import JSONB
from sqlalchemy.sql import func
import uuid
from ..db.session import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String, nullable=False)
    # alert.created, alert.feedback_submitted, customer.created, regulatory.polled, rule.recommended
    payload_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<AuditEvent type={self.event_type} at={self.created_at}>"
