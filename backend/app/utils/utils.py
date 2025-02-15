from fastapi import HTTPException,status
from pydantic import EmailStr
from app.core.connection import db


def get_user_by_email(email : EmailStr):
    try:
        response = db.table("users").select("*").eq("email",email).execute()
        return response.data
    except Exception as e:
        return HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT,detail="Error Ocurred While Fetching Data")
    