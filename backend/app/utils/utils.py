from fastapi import HTTPException,status
from app.core.connection import db


def check_user_present(email : str):
    try:
        response = db.table("users").select("*").eq("email",email).execute()
        return response
    except Exception as e:
        return HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT,detail="Error Ocurred While Fetching Data")
    