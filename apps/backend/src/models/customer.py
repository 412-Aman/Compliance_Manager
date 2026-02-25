
from sqlalchemy import Column, String, DateTime, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from ..db.types import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..db.session import Base

class Customer(Base):
    __tablename__ = "customers"
    __table_args__ = (UniqueConstraint('chain', 'address', name='uq_chain_address'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    label = Column(String, nullable=False)  # "Demo Whale", "Student Wallet"
    chain = Column(String, nullable=False)  # polygon|ethereum|arbitrum
    address = Column(String, nullable=False)
    declared_profile_json = Column(JSONB, nullable=True)
    # { country, income_band, occupation, source_of_funds, expected_monthly_volume_usd, risk_appetite }
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    alerts = relationship("Alert", back_populates="customer", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="customer", cascade="all, delete-orphan")
    baselines = relationship("Baseline", back_populates="customer", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Customer label={self.label} address={self.address[:10]}...>"
