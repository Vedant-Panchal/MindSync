from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.api.routes import auth,journals
from app.core.security import AuthMiddleware
from starlette.middleware.sessions import SessionMiddleware
from loguru import logger
import sys
from app.core.config import JWT_SECRET
from app.core.exceptions import APIException, api_exception_handler, generic_exception_handler
logger.remove()
logger.add(sys.stdout)
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:8000",
]
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(middleware_class=AuthMiddleware)
app.add_middleware(SessionMiddleware, secret_key=JWT_SECRET)
app.add_exception_handler(APIException,api_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
app.include_router(auth.router, prefix="/auth/v1", tags=["Authentication"])
app.include_router(journals.router)

@app.get("/heartbeat", tags=["Health Check"])
async def heartbeat():
    return {
        "status": "ok",
        "message": "Welcome to the AI Journaling Platform",
        "timestamp": datetime.utcnow().isoformat()
    }
