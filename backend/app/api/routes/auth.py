from fastapi import APIRouter, HTTPException
from uuid import uuid4
from datetime import datetime,timezone
from app.core.config import EXPIRES_IN
from fastapi.encoders import jsonable_encoder
from app.core.connection import db
import re
from app.db.schemas.user import UserInDB, CreateUser,userSignIN
from app.services.auth import hashPass, createToken,verify

router = APIRouter()


PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
@router.post("/sign-up")
async def sign_up(data: CreateUser):
    try:
        existing_user = db.table("users").select("*").eq("email", data.email).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
    if existing_user.data:
        raise HTTPException(status_code=400, detail="User already exists")
    if not re.fullmatch(PASSWORD_REGEX, data.password):
        raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")
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
    
# @router.post("/sign-in")
# async def signIn(data : userSignIN):
#     try:
#         response = db.table("users").select("*").eq("email", data.email).execute()
#         existing_user  : UserInDB = response.data[0] if response.data else None
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
#     if not existing_user:
#         raise HTTPException(status_code=400, detail="No email Exists with this User")
#     else:
#         print(f"""
#         **********************************
#             {
#                 existing_user.password,
#                 existing_user.email
#              }
#         **********************************
#         """)
#         userPass = existing_user.password
#         isVerified = verify(data.password, userPass)
#         if isVerified:
#             token = createToken(existing_user,EXPIRES_IN)
#             return {
#                 "message": "User signed in successfully", 
#                 "email": data.email,
#                 "token": token
#             }
#         else:
#             raise HTTPException(status_code=401, detail=f"Incorrect Password")

@router.post("/sign-in")
async def signIn(data: userSignIN):
    try:
        # Fetch user data including password
        response = db.table("users").select("*").eq("email", data.email).execute()

        # Ensure data exists
        if not response.data:
            raise HTTPException(status_code=400, detail="No email exists with this user")

        # Extract user data (first element of response.data list)
        existing_user = response.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")

    # Verify password
    print(f"""
        **********************************
            {existing_user["password"]}
        **********************************
        """)
    is_verified = verify(data.password, existing_user["password"])
    if is_verified:
        token = createToken(existing_user, EXPIRES_IN)
        return {
            "message": "User signed in successfully",
            "email": data.email,
            "token": token
        }
    else:
        raise HTTPException(status_code=401, detail="Incorrect Password")




