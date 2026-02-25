
from sqlalchemy import Column, String, DateTime, BigInteger, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..db.session import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chain = Column(String, nullable=False)
    tx_hash = Column(String, nullable=False, unique=True)
    block_number = Column(BigInteger, nullable=False)
    block_time = Column(DateTime(timezone=True), nullable=False)
    from_addr = Column(String, nullable=False)
    to_addr = Column(String, nullable=False)
    asset = Column(String, default="NATIVE")  # NATIVE|USDC|...
    amount_raw = Column(Numeric, nullable=False)
    amount_usd = Column(Numeric, nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    direction = Column(String, nullable=True)  # IN|OUT relative to customer
    counterparty = Column(String, nullable=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction hash={self.tx_hash[:10]}... amount={self.amount_usd}>"
