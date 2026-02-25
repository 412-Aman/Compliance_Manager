import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from src.core.config import settings

logger = logging.getLogger(__name__)

class EtherscanClient:
    """
    Client for Etherscan API V2 to fetch transaction history for addresses.
    Uses unified V2 endpoint with chainid parameter.
    """
    
    # Mapping of chain names to Chain IDs for Etherscan V2
    CHAIN_IDS = {
        "ethereum": 1,
        "polygon": 137,
        "arbitrum": 42161,
    }
    
    BASE_URL = "https://api.etherscan.io/v2/api"
    
    def __init__(self, chain: str = "ethereum"):
        self.chain = chain.lower()
        self.chain_id = self.CHAIN_IDS.get(self.chain, 1)
        # For demo purposes, use a free API key or leave blank
        self.api_key = getattr(settings, 'ETHERSCAN_API_KEY', '')
    
    async def get_transactions(
        self, 
        address: str, 
        start_block: int = 0, 
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Fetch normal (ETH) transactions for an address using V2 API."""
        params = {
            "chainid": self.chain_id,
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": start_block,
            "endblock": 99999999,
            "page": 1,
            "offset": limit,
            "sort": "desc",
        }
        if self.api_key:
            params["apikey"] = self.api_key
            
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(self.BASE_URL, params=params)
                data = response.json()
                
                # V2 success status is "1" (legacy support) or result being a list
                # Some V2 docs say "success" but status "1" often still works for txlist
                if data.get("status") == "1" and isinstance(data.get("result"), list):
                    txs = self._parse_transactions(address, data["result"])
                    logger.info(f"✅ Fetched {len(txs)} transactions for {address[:10]}... (V2 ChainID: {self.chain_id})")
                    return txs
                elif data.get("message") == "No transactions found":
                    logger.info(f"ℹ️ No transactions found for {address[:10]}...")
                    return []
                elif data.get("status") == "0" or data.get("message") == "NOTOK":
                    result_msg = data.get("result", "Unknown error")
                    if "rate limit" in str(result_msg).lower() or "max rate" in str(result_msg).lower():
                        logger.warning(f"⚠️ Rate limited by Etherscan. Add ETHERSCAN_API_KEY to .env for higher limits.")
                    elif "deprecated" in str(result_msg).lower():
                        logger.error(f"❌ Etherscan V1 Deprecation error: {result_msg}")
                    else:
                        logger.warning(f"⚠️ Etherscan error: {result_msg}")
                    return []
                else:
                    logger.warning(f"Etherscan API response: {data.get('message', 'Unknown')}")
                    return []
            except Exception as e:
                logger.error(f"Error fetching transactions: {e}")
                return []
    
    def _parse_transactions(self, our_address: str, raw_txs: List[Dict]) -> List[Dict[str, Any]]:
        """Parse Etherscan response into our transaction format."""
        our_addr_lower = our_address.lower()
        parsed = []
        
        for tx in raw_txs:
            from_addr = tx.get("from", "").lower()
            to_addr = tx.get("to", "").lower()
            
            direction = "IN" if to_addr == our_addr_lower else "OUT"
            counterparty = from_addr if direction == "IN" else to_addr
            
            # Convert wei to ETH
            value_wei = int(tx.get("value", "0"))
            value_eth = value_wei / 1e18
            
            # Estimate USD value (rough estimate: 1 ETH ~ $2000)
            value_usd = value_eth * 2000
            
            parsed.append({
                "tx_hash": tx.get("hash"),
                "block_number": int(tx.get("blockNumber", 0)),
                "block_time": datetime.fromtimestamp(int(tx.get("timeStamp", 0))),
                "from_addr": tx.get("from"),
                "to_addr": tx.get("to"),
                "asset": "ETH",
                "amount_raw": value_eth,
                "amount_usd": value_usd,
                "direction": direction,
                "counterparty": counterparty
            })
        
        return parsed
