
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..db.types import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..db.session import Base

class Baseline(Base):
    __tablename__ = "baselines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    window = Column(String, nullable=False)  # 7d|30d|90d
    computed_at = Column(DateTime(timezone=True), server_default=func.now())
    stats_json = Column(JSONB, nullable=True)
    # { tx_count_mean_per_day, tx_count_p95_per_day, amount_median, amount_mad, counterparty_entropy, active_hours_histogram }
    
    # Relationships
    customer = relationship("Customer", back_populates="baselines")

    def __repr__(self):
        return f"<Baseline customer_id={self.customer_id} window={self.window}>"
