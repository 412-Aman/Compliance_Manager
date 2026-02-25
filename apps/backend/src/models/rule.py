
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from ..db.types import JSONB
from sqlalchemy.sql import func
import uuid
from ..db.session import Base

class Rule(Base):
    __tablename__ = "rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jurisdiction = Column(String, nullable=False)
    name = Column(String, nullable=False)
    version = Column(Integer, default=1)
    definition_json = Column(JSONB, nullable=True)
    active_from = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Rule name={self.name} jurisdiction={self.jurisdiction} v{self.version}>"
