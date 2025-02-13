from fastapi import FastAPI
from datetime import datetime
from app.api.routes import auth
from app.api.routes import journals
from app.core.security import auth_middleware

app = FastAPI()
app.middleware("http")(auth_middleware)
app.include_router(auth.router, prefix="/auth/v1", tags=["Authentication"])
app.include_router(journals.router)

@app.get("/heartbeat", tags=["Health Check"])
async def heartbeat():
    return {
        "status": "ok",
        "message": "Welcome to the AI Journaling Platform",
        "timestamp": datetime.utcnow().isoformat()
    }
