
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from ..db.types import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..db.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    alert_type = Column(String, nullable=False)
    # VELOCITY_SPIKE|AMOUNT_SPIKE|COUNTERPARTY_NOVELTY|NETWORK_ASSOCIATION|REGULATORY_GAP
    risk_score = Column(Float, nullable=False)  # 0-100
    confidence = Column(Float, nullable=False)  # 0-1
    status = Column(String, default="OPEN")  # OPEN|ESCALATED|CLOSED
    drivers_json = Column(JSONB, nullable=True)
    # [{ feature, observed, expected, delta, severity, evidence }]
    explanation_nl = Column(Text, nullable=True)
    recommendations_nl = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="alerts")
    feedbacks = relationship("Feedback", back_populates="alert", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Alert id={self.id} type={self.alert_type} score={self.risk_score}>"
