from fastapi import FastAPI
from datetime import datetime
from app.api.routes import auth
from app.api.routes import journals
from app.core.security import AuthMiddleware
from starlette.middleware.sessions import SessionMiddleware
from loguru import logger
import sys
from app.core.config import JWT_SECRET
logger.remove()
logger.add(sys.stdout)
app = FastAPI()

app.add_middleware(middleware_class=AuthMiddleware)
app.add_middleware(SessionMiddleware, secret_key=JWT_SECRET)

app.include_router(auth.router, prefix="/auth/v1", tags=["Authentication"])
app.include_router(journals.router)

@app.get("/heartbeat", tags=["Health Check"])
async def heartbeat():
    return {
        "status": "ok",
        "message": "Welcome to the AI Journaling Platform",
        "timestamp": datetime.utcnow().isoformat()
    }
