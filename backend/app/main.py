import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.api.routes import auth, journals, chatbot
from app.core.security import AuthMiddleware
from starlette.middleware.sessions import SessionMiddleware
from loguru import logger
import sys
from app.core.config import JWT_SECRET
from app.core.exceptions import (
    APIException,
    api_exception_handler,
    generic_exception_handler,
)

logger.remove()
logger.add(sys.stdout)
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:8000",
]
APP_ENV = os.environ.get("APP_ENV", "development")

if APP_ENV == "production":
    docs_url = None
    redoc_url = None
    openapi_url = None
else:
    docs_url = "/docs"
    redoc_url = "/redoc"
    openapi_url = "/openapi.json"

app = FastAPI(docs_url=docs_url, redoc_url=redoc_url, openapi_url=openapi_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(middleware_class=AuthMiddleware)
app.add_middleware(SessionMiddleware, secret_key=JWT_SECRET)
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
app.include_router(auth.router, prefix="/auth/v1", tags=["Authentication"])
app.include_router(journals.router, prefix="/api/v1/journals", tags=["Journals"])
app.include_router(chatbot.router, prefix="/api/v1/chat", tags=["Chatbot"])







@app.get("/heartbeat", tags=["Health Check"])
async def heartbeat():
    return {
        "status": "ok",
        "message": "Welcome to the AI Journaling Platform",
        "timestamp": datetime.utcnow().isoformat(),
    }
