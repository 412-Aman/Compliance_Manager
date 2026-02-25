from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.transaction import Transaction
from datetime import datetime

class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_transaction(
        self,
        chain: str,
        tx_hash: str,
        block_number: int,
        block_time: datetime,
        from_addr: str,
        to_addr: str,
        asset: str,
        amount_raw: float,
        amount_usd: Optional[float],
        customer_id: Optional[UUID],
        direction: str,
        counterparty: str
    ) -> Transaction:
        tx = Transaction(
            chain=chain,
            tx_hash=tx_hash,
            block_number=block_number,
            block_time=block_time,
            from_addr=from_addr,
            to_addr=to_addr,
            asset=asset,
            amount_raw=amount_raw,
            amount_usd=amount_usd,
            customer_id=customer_id,
            direction=direction,
            counterparty=counterparty
        )
        self.db.add(tx)
        # Not committing here usually, as we might do scoring in the same transaction
        return tx

    async def list_customer_transactions(self, customer_id: UUID, limit: int = 50) -> List[Transaction]:
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.customer_id == customer_id)
            .order_by(Transaction.block_time.desc())
            .limit(limit)
        )
        return result.scalars().all()
