
from fastapi import APIRouter, Cookie, HTTPException,responses,Response, Header, status
from uuid import uuid4
from datetime import datetime, timezone
from app.core.config import EXPIRES_IN
from fastapi.encoders import jsonable_encoder
from app.core.connection import db
import re
from app.db.schemas.user import UserInDB, create_user,VerifyUser,ResetPasswordRequest
from app.db.schemas.user import SignUpType,verify_otp_type
from app.services.auth import hashPass, create_token,verify
from app.db.schemas.supabase import SupabaseResponse
from app.utils.email import send_otp_email
from app.utils.utils import check_user_present
from app.utils.otp_utils import generate_otp_jwt, verify_token

router = APIRouter()


PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"


router = APIRouter()
@router.post("/sign-up")
async def sign_up(data: SignUpType, response: Response):
    try:
        existing_user = db.table("users").select("*").eq("email", data.email).execute()
        
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="User already exists"
            )
        
        otp = str(uuid4().int)[:6]
        send_otp_email(data.email, otp)
        used = False
        otp_token = generate_otp_jwt(data.email, otp)
        
        response.set_cookie(
            key="sign_up_token",
            value=otp_token,
            max_age=600,
            httponly=True,
            secure=False,
            samesite="Lax"
        )
        print(response.headers)

        
        return responses.JSONResponse(
            content={"message": "OTP Sent Successfully"},
            status_code=status.HTTP_200_OK
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database query failed: {str(e)}"
        )

@router.post("/verify-otp")
async def verify_otp(
    response: Response,
    data: create_user,
    sign_up_token: str | None = Cookie(None)
):
    if not sign_up_token:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="OTP token missing in cookies"
        )
    
    try:
        print(sign_up_token)
        otpData = verify_otp_type(
            token = sign_up_token,
            otp = data.otp
        )
        email = verify_token(otpData)
        hash_password = hashPass(data.password)
        
        user = UserInDB(
            id=str(uuid4()),
            email=email,
            username=data.username,
            password=hash_password,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            is_verified=True,
        )

        user_token = create_token(user, EXPIRES_IN)
        db.table("users").insert(jsonable_encoder(user)).execute()

        response.delete_cookie("sign_up_token")
        response.set_cookie(
            key="user_token",
            value=user_token,
            max_age=691200,
            httponly=True,
            secure=True,
            samesite="Lax"
        )
        return {
            "message": "User created successfully.",
            "email": email,
            "token": user_token,
        }
        
    except Exception as e:
        # raise HTTPException(
        #     status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
        #     detail=f"Error while signing up"
        # )
        # raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error while signing up: {str(e)}"
        )
        # return responses.JSONResponse(
        # # status_code=500,
        # # content={"message": "Error while signing up", "statuscode": 500}
        # # )

@router.post("/sign-in")
async def signIn(data: VerifyUser):
    response = check_user_present(data.email)
    if not response.data:
        return HTTPException(status_code=400, detail="No email exists with this user")

    existing_user = UserInDB(**response.data[0])
    
    if not existing_user.is_verified:
        return HTTPException(status_code=401, detail="User is not verified. Please complete OTP verification")
    
    is_verified = verify(data.password,existing_user.password)
    if is_verified:
        token = create_token(existing_user, EXPIRES_IN)
        return {    
            "message": "User signed in successfully",
            "email": data.email,
            "token": token
        }
    else:
        return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect Password")

@router.post("/reset-password",response_model=None)
async def reset_password(response : Response,email : str):
    user_data = check_user_present(email)
    if not user_data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="No User Exists With This Email")
    else:
        if not isinstance(response, Response):
            raise TypeError("Response object is not an instance of fastapi.Response")
        otp = str(uuid4().int)[:6]
        send_otp_email(email, otp)
        otpToken = generate_otp_jwt(email,otp)
        response.set_cookie(
            key="reset_password_token",
            value = otpToken,
            max_age=600,
            httponly=True,
            secure=False,
            samesite="Lax"
        )
        print(response.headers)
        return {
            "message" : "OTP Sent Successfully",
            "token" : otpToken
        }

@router.put("/reset-password")
async def reset_password(
    response:Response,
    data: ResetPasswordRequest,
    reset_cookie: str | None = Cookie(None)
):

    entered_otp = data.entered_otp
    newPassword = data.new_password
    if not reset_cookie:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="OTP token missing in cookies"
        )
    
    token_data = verify_otp_type(
        token=reset_cookie,
        otp=entered_otp
    )
    email = verify_token(token_data)
    userData = check_user_present(email)
    if not userData.data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="No User Exists With This Email")
    else:
        existingUser = UserInDB(**userData.data[0])
        if not re.fullmatch(PASSWORD_REGEX, newPassword):
            raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")

        hashedPassword = hashPass(newPassword)
        try:
            db.table("users").update({"password": hashedPassword}).eq("email", email).execute()
            response.delete_cookie("reset_cookie")
            return{
                "message" : "Password Updated Successfully"
            }
        except:
            raise HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT,detail="Error Ocurred While Updating Password")


