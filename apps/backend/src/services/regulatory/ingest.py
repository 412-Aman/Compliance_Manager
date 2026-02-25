import httpx
import logging
import hashlib
from datetime import datetime
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.regulatory_doc import RegulatoryDoc
from src.services.regulatory.sources import REGULATORY_SOURCES 
from src.integrations.llm.client import LLMClient
from src.services.audit import AuditService

logger = logging.getLogger(__name__)

async def poll_regulatory_sources(db: AsyncSession):
    logger.info("Polling regulatory sources...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive"
    }
    async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
        sources = REGULATORY_SOURCES
        
        for source in sources:
            try:
                response = await client.get(source['url'])
                response.raise_for_status()
                
                content = response.text
                content_hash = hashlib.sha256(content.encode()).hexdigest()
                
                existing = await db.execute(
                    select(RegulatoryDoc).where(RegulatoryDoc.content_hash == content_hash)
                )
                if existing.scalars().first():
                    continue
                
                soup = BeautifulSoup(content, 'lxml')
                for script in soup(["script", "style"]):
                    script.extract()
                
                text = soup.get_text(separator=' ', strip=True)
                
                new_doc = RegulatoryDoc(
                    source=source['name'],
                    jurisdiction=source['jurisdiction'],
                    url=source['url'],
                    content_hash=content_hash,
                    raw_text=text[:10000],
                    fetched_at=datetime.utcnow()
                )
                db.add(new_doc)
                await db.flush()
                
                await analyze_regulatory_doc(db, new_doc)
                await db.commit()
                
                audit = AuditService(db)
                await audit.log_event("regulatory.polled", {
                    "source": source['name'],
                    "doc_id": str(new_doc.id),
                    "url": source['url']
                })
                
            except Exception as e:
                logger.error(f"Error polling {source['name']}: {e}")

async def analyze_regulatory_doc(db: AsyncSession, doc: RegulatoryDoc):
    logger.info(f"Analyzing {doc.source} doc...")
    llm = LLMClient()
    system_msg = """
    Extract key information from the provided regulatory update.
    Return JSON: { "summary": str, "obligations": list[str], "entities_in_scope": list[str], "deadlines": list[str] }
    """
    prompt = f"Text:\n{doc.raw_text[:5000]}"
    analysis = await llm.generate_json(prompt, system_msg)
    if analysis:
        doc.parsed_json = analysis
