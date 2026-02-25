import asyncio
import logging
from src.integrations.chain.etherscan import EtherscanClient
from src.services.transactions import TransactionService
from src.services.customers import CustomerService
from src.services.anomalies.scoring import AnomalyScorer
from src.db.session import async_session
from sqlalchemy import select
from src.models.transaction import Transaction

logger = logging.getLogger(__name__)

# Track last processed transaction hash per customer to avoid duplicates
last_seen_hashes = {}

async def stream_customer_transactions():
    """
    Background worker that polls Etherscan for new transactions 
    for all monitored customer addresses.
    """
    logger.info("🚀 Starting REAL blockchain transaction worker...")
    
    while True:
        try:
            async with async_session() as db:
                customer_service = CustomerService(db)
                tx_service = TransactionService(db)
                scorer = AnomalyScorer(db)
                
                customers = await customer_service.list_customers(limit=100)
                
                if not customers:
                    logger.info("No customers to monitor. Waiting...")
                    await asyncio.sleep(30)
                    continue
                
                logger.info(f"📡 Scanning {len(customers)} customer(s) for new transactions...")
                
                for i, customer in enumerate(customers):
                    try:
                        # Process each customer in its own mini-transaction
                        await process_customer(db, customer, tx_service, scorer)
                        await db.commit() # Commit changes for this customer
                    except Exception as e:
                        logger.error(f"Error processing customer {customer.label}: {e}")
                        await db.rollback()
                        
                    # Rate limit: With API key = 5 calls/sec, so wait 0.25s between calls
                    if i < len(customers) - 1:
                        await asyncio.sleep(0.25)


            
            # Poll every 30 seconds to respect API rate limits
            await asyncio.sleep(30)
            
        except Exception as e:
            logger.error(f"Worker error: {e}")
            await asyncio.sleep(60)

async def process_customer(db, customer, tx_service, scorer):
    """Fetch and process new transactions for a single customer."""
    try:
        client = EtherscanClient(chain=customer.chain)
        
        # Fetch latest transactions
        raw_txs = await client.get_transactions(customer.address, limit=20)
        
        if not raw_txs:
            logger.debug(f"No new transactions for {customer.label}")
            return
        
        new_count = 0
        for tx_data in raw_txs:
            # Check if we already have this transaction
            existing = await db.execute(
                select(Transaction).where(Transaction.tx_hash == tx_data["tx_hash"])
            )
            if existing.scalars().first():
                continue
            
            # Create the transaction record
            tx = await tx_service.create_transaction(
                chain=customer.chain,
                tx_hash=tx_data["tx_hash"],
                block_number=tx_data["block_number"],
                block_time=tx_data["block_time"],
                from_addr=tx_data["from_addr"],
                to_addr=tx_data["to_addr"],
                asset=tx_data["asset"],
                amount_raw=tx_data["amount_raw"],
                amount_usd=tx_data["amount_usd"],
                customer_id=customer.id,
                direction=tx_data["direction"],
                counterparty=tx_data["counterparty"]
            )
            
            await db.flush()
            new_count += 1
            
            # Score for anomalies
            await scorer.score_transaction(tx)
        
        if new_count > 0:
            logger.info(f"✅ Recorded {new_count} new transactions for {customer.label}")
            
    except Exception as e:
        logger.error(f"Error processing {customer.label}: {e}")

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    asyncio.run(stream_customer_transactions())
