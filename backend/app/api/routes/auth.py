from fastapi import APIRouter, HTTPException
from uuid import uuid4
from datetime import datetime,timezone
from app.core.config import EXPIRES_IN
from fastapi.encoders import jsonable_encoder
from app.core.connection import db
from app.db.schemas.user import UserInDB, CreateUser
from app.services.auth import hashPass, createToken

router = APIRouter()

@router.post("/sign-up")
async def sign_up(data: CreateUser):
    # Check if user already exists
    try:
        existing_user = db.table("users").select("*").eq("email", data.email).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")

    if existing_user.data:
        raise HTTPException(status_code=400, detail="User already exists")

    # Hash the password and create user object
    hash_password = hashPass(data.password)
    user = UserInDB(
        id=str(uuid4()),
        email=data.email,
        username=data.username,
        password=hash_password,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    # Insert user into DB with JSON serialization
    try:
        db.table("users").insert(jsonable_encoder(user)).execute()
        return {
        "message": "User created successfully", 
        "email": data.email,
        "token": createToken(user, EXPIRES_IN)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while signing up: {str(e)}")
