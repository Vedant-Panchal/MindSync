from fastapi import FastAPI
from datetime import datetime
from app.api.routes import auth
from app.api.routes import journals
from app.core.security import AuthMiddleware
from loguru import logger
import sys
logger.remove()
logger.add(sys.stdout)
app = FastAPI()

app.add_middleware(middleware_class=AuthMiddleware)

app.include_router(auth.router, prefix="/auth/v1", tags=["Authentication"])
app.include_router(journals.router)

@app.get("/heartbeat", tags=["Health Check"])
async def heartbeat():
    return {
        "status": "ok",
        "message": "Welcome to the AI Journaling Platform",
        "timestamp": datetime.utcnow().isoformat()
    }
