from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.customer import Customer
from src.services.audit import AuditService
import logging

logger = logging.getLogger(__name__)

class CustomerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.audit = AuditService(db)

    async def create_customer(self, label: str, chain: str, address: str, profile: dict) -> Customer:
        customer = Customer(
            label=label,
            chain=chain,
            address=address,
            declared_profile_json=profile
        )
        self.db.add(customer)
        await self.db.commit()
        await self.db.refresh(customer)
        
        await self.audit.log_event("customer.created", {
            "customer_id": str(customer.id),
            "label": customer.label,
            "address": customer.address
        })
        
        return customer

    async def get_customer(self, customer_id: UUID) -> Optional[Customer]:
        result = await self.db.execute(select(Customer).where(Customer.id == customer_id))
        return result.scalars().first()

    async def get_customer_by_address(self, address: str) -> Optional[Customer]:
        result = await self.db.execute(select(Customer).where(Customer.address == address))
        return result.scalars().first()

    async def list_customers(self, skip: int = 0, limit: int = 100) -> List[Customer]:
        result = await self.db.execute(select(Customer).offset(skip).limit(limit))
        return result.scalars().all()
