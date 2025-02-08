from fastapi import FastAPI
from app.api.routes import auth

app = FastAPI()

app.include_router(auth.router,prefix="/auth",tags=["Authentication"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Journaling Platform dalle!"}