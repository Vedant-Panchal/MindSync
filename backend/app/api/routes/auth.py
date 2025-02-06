from fastapi import APIRouter, HTTPException
from app.core.connection import db
from datetime import datetime
from app.db.schemas.user import UserInDB
from app.services.auth import getToken,hashPass,verify,createToken
import re
from uuid import uuid4
router = APIRouter()


PASSWORD_REGEX = r"""^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$"""



@router.post("/sign-up")
async def sign_up(data : UserInDB):
    existingUser  = await db.table("users").select("*").eq("email",data.email).execute()
    if existingUser.data:
        raise HTTPException(status_code=400, detail="User already exists")
    else : 
        if not re.match(PASSWORD_REGEX,data.password):
            raise HTTPException(401,detail = "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and be at least 8 characters long.")
        hashPassword = hashPass(data.password)
        try :
            user = UserInDB()(
                id=str(uuid4()),
                email = data.email,
                username = data.username,
                password = hashPassword,
                created_at = datetime.now(),
                update_at = datetime.now()
                )
            await db.table("users").insert(user).execute()
            # newUser = await db.table("users").insert({
            #     UserInDB()()
            #     "id" : str(uuid4()),
            #     "email" : data.email,
            #     "username" : data.username,
            #     "password" : hashPassword,
            #     "created_at" : datetime.now(),
            #     "update_at" : datetime.now()
            # }).execute()
            try :
                createToken(data,datetime())
            except Exception as e :
                raise HTTPException(status_code=401,detail= "Failed Token Creation")
        except Exception as e:
            raise HTTPException(status_code=401,detail= "Error While Signing Up")
        return {
            "message" : f"User Created With Username : {data.username}"
        }
        

