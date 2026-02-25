import logging
import asyncio
import os
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from src import models
from src.api.v1 import (
    routes_alerts,
    routes_customers,
    routes_regulatory,
    routes_health,
    routes_admin
)
from src.core.config import settings
from src.services.websocket import manager
from src.db.session import engine, Base

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Live Blockchain Anomaly Detection & Regulatory Radar",
    version="1.0.0",
)

# ADD IT HERE — immediately after app creation
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://resourceful-playfulness-production-0be6.up.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 🚨 GLOBAL CORS & ERROR RESOLUTION 🚨 ---
# Now controlled via nixpacks.toml environment variables
CORS_ORIGINS = os.getenv("BACKEND_CORS_ORIGINS", "*").split(",")

@app.middleware("http")
async def force_cors_and_catch_errors(request, call_next):
    # 1. Immediate Pre-flight (OPTIONS) Handling
    if request.method == "OPTIONS":
        from fastapi.responses import Response
        response = Response(status_code=204)
        origin = request.headers.get("origin", "*")
        
        # Check if origin is allowed
        allowed_origin = origin if "*" in CORS_ORIGINS or origin in CORS_ORIGINS else CORS_ORIGINS[0]
        
        response.headers["Access-Control-Allow-Origin"] = allowed_origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response

    # 2. Global Safety Wrapper
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"💥 CRITICAL APP ERROR: {e}", exc_info=True)
        from fastapi.responses import JSONResponse
        response = JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "error": str(e)}
        )

    # 3. Force CORS Headers on EVERY response
    origin = request.headers.get("origin", "*")
    allowed_origin = origin if "*" in CORS_ORIGINS or origin in CORS_ORIGINS else CORS_ORIGINS[0]
    
    response.headers["Access-Control-Allow-Origin"] = allowed_origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# REMOVED: Standard CORSMiddleware to prevent conflicts
# --- END GLOBAL FIX ---

# Register routers
app.include_router(routes_health.router, prefix=f"{settings.API_V1_STR}/health", tags=["health"])
app.include_router(routes_alerts.router, prefix=f"{settings.API_V1_STR}/alerts", tags=["alerts"])
app.include_router(routes_customers.router, prefix=f"{settings.API_V1_STR}/customers", tags=["customers"])
app.include_router(routes_regulatory.router, prefix=f"{settings.API_V1_STR}/regulatory", tags=["regulatory"])
app.include_router(routes_admin.router, prefix=f"{settings.API_V1_STR}/audit", tags=["audit"])

# Background task reference
background_tasks = set()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Echo: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected from WebSocket")

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "Compliance Engine API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.on_event("startup")
async def startup_event():
    print("==================================================")
    print("🚀 COMPLIANCE ENGINE v2.1.0-FIXED DEPLOYED")
    print("==================================================")
    
    # Ensure database tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables synced")
    
    # Start background transaction worker
    if os.getenv("DISABLE_WORKER", "false").lower() != "true":
        from src.workers.jobs.stream_chain import stream_customer_transactions
        task = asyncio.create_task(stream_customer_transactions())
        background_tasks.add(task)
        task.add_done_callback(background_tasks.discard)
        print("⚡ Transaction worker started as background task")
    
    print(f"📡 API available at http://localhost:8000")
    print(f"📖 Documentation at http://localhost:8000/docs")

@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Shutting down background tasks...")
    for task in background_tasks:
        task.cancel()
    print("✅ Shutdown complete")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
