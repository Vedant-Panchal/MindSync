from fastapi import FastAPI
from datetime import datetime
from app.api.routes import auth

app = FastAPI()

app.include_router(auth.router, prefix="/auth/v1", tags=["Authentication"])

@app.get("/heartbeat", tags=["Health Check"])
async def heartbeat():
    return {
        "status": "ok",
        "message": "Welcome to the AI Journaling Platform",
        "timestamp": datetime.utcnow().isoformat()
    }
