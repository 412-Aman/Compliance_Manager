from web3 import Web3
from src.core.config import settings

class EVMProvider:
    def __init__(self, rpc_url: str = settings.POLYGON_RPC_URL):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))

    def is_connected(self) -> bool:
        return self.w3.is_connected()

    def to_checksum_address(self, address: str) -> str:
        return Web3.to_checksum_address(address)

    async def get_latest_block(self) -> int:
        return self.w3.eth.block_number

    async def get_transaction(self, tx_hash: str) -> dict:
        return self.w3.eth.get_transaction(tx_hash)
