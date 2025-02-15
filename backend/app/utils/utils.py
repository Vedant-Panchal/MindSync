from fastapi import HTTPException,status
from pydantic import EmailStr
from app.core.connection import db


def check_user_present(email : EmailStr):
    try:
        response = db.table("users").select("*").eq("email",email).execute()
        return response.data
    except Exception as e:
        return HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT,detail="Error Ocurred While Fetching Data")
    