from fastapi import FastAPI
from app.api.routes import auth

app = FastAPI()

# Include the router from the hello endpoint
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Journaling Platform!"}