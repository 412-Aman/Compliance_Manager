
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from ..db.types import JSONB
from sqlalchemy.sql import func
import uuid
from ..db.session import Base

class RegulatoryDoc(Base):
    __tablename__ = "regulatory_docs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(String, nullable=False) # FATF, FCA, etc.
    jurisdiction = Column(String, nullable=True)
    url = Column(String, nullable=False)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
    content_hash = Column(String, nullable=True)
    raw_text = Column(Text, nullable=True)
    parsed_json = Column(JSONB, nullable=True) 
    # { summary, obligations[], deadlines[], entities_in_scope[], citations[] }

    def __repr__(self):
        return f"<RegulatoryDoc source={self.source} id={self.id}>"
