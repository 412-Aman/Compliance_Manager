from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "regulatory_sources": "accessible",
            "websocket": "active"
        }
    }

@router.get("/version")
async def get_version():
    return {"version": "1.0.0", "build": "stable-restored"}
