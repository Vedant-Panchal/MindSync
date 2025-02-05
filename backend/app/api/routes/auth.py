from fastapi import APIRouter

router = APIRouter()

@router.get("/auth")
def sign_in():
    return {"message": "Sign in"}
