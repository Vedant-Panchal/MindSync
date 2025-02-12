
from fastapi import APIRouter, Cookie, HTTPException,responses,Response, Header, status
from uuid import uuid4
from datetime import datetime, timezone
from jose import jwe
from pydantic import EmailStr
from rsa import decrypt
from app.core.config import EXPIRES_IN
from fastapi.encoders import jsonable_encoder
from app.core.connection import db
import re
from app.db.schemas.user import UserInDB, create_user,VerifyUser,ResetPasswordRequest
from app.db.schemas.user import SignUpType,verify_otp_type
from app.services.auth import hashPass, create_token,verify_pass
from app.db.schemas.supabase import SupabaseResponse
from app.utils.email import send_otp_email
from app.utils.otp_utils import verify_otp
from app.utils.utils import check_user_present
from app.utils.otp_utils import generate_otp_jwt, store_otp, verify_token,encrypt_jwt,decrypt_jwt
from app.core.config import JWT_SECRET
router = APIRouter()

PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"


router = APIRouter()
@router.post("/sign-up")
async def sign_up(response: Response,data: SignUpType):
    try:
        existing_user = db.table("users").select("*").eq("email", data.email).execute()
        
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="User already exists"
            )
        
        otp:str = str(uuid4().int)[:6]
        # otp_token:str = generate_otp_jwt(data.email, otp)
        # encrypted_token = encrypt_jwt(otp_token)
        # print("encrypted token : " ,encrypted_token)
        send_otp_email(data.email, otp)
        # response.set_cookie(
        #     key="signup_token",
        #     value=encrypted_token,
        #     max_age=600,
        #     httponly=True,
        #     secure=False,
        #     samesite="Lax"
        # )
        # print(response.headers)

        store_otp(data.email,otp)        
        return {
            "message": "OTP Sent Successfully",
            "status_code":status.HTTP_200_OK
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database query failed: {str(e)}"
        )

@router.post("/verify-otp")
async def verify(
    response: Response,
    data: create_user,
    # signup_token: str | None = Cookie(None)
):
    # if not signup_token:
    #     return HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED, 
    #         detail="OTP token missing in cookies"
    #     )
    email = data.email
    password = data.password
    if not re.fullmatch(PASSWORD_REGEX, password):
            raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")
    try:
        # print("encyrpted otp ",signup_token)
        # decrypt_otp = decrypt_jwt(signup_token)
        # otpData = verify_otp_type(
        #     token = decrypt_otp,
        #     otp = data.otp
        # )
        # print("decrypted otp ",decrypt_otp)
        if not verify_otp(email,data.otp):  
            raise HTTPException(status_code=400, detail="Incorrect or expired OTP")
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

        access_token = create_token(user, EXPIRES_IN)
        db.table("users").insert(jsonable_encoder(user)).execute()

        response.delete_cookie("signup_token")
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=691200,
            httponly=True,
            secure=False,
            samesite="Lax"
        )
        return {
            "message": "User created successfully.",
            "email": email,
            "token": access_token,
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error while signing up: {str(e)}"
        )

@router.post("/sign-in")
async def signIn(response: Response,data: VerifyUser):
    user = check_user_present(data.email)
    password:str = data.password
    if not re.fullmatch(PASSWORD_REGEX, password):
            raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")
    if not user:
        raise HTTPException(status_code=400, detail="No email exists with this user")

    existing_user = UserInDB(**user[0])
    
    if not existing_user.is_verified:
        raise HTTPException(status_code=401, detail="User is not verified. Please complete OTP verification")
    
    is_verified = verify_pass(data.password,existing_user.password)
    
    if is_verified:
        token = create_token(existing_user, EXPIRES_IN)
        response.set_cookie(
        key="access_token",
        value=token,
        max_age=600,
        httponly=True,
        secure=False,
        samesite="Lax"
        )
        print(response.headers)
        return {    
            "message": "User signed in successfully",
            "email": data.email,
            "token": token
        }
    else:
        return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect Password")

@router.post("/reset-password",response_model=None)
async def reset_password(response : Response,email : EmailStr):
    user_data = check_user_present(email)
    print(user_data)
    if not user_data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="No User Exists With This Email")
    else:
        if not isinstance(response, Response):
            raise TypeError("Response object is not an instance of fastapi.Response")
        otp = str(uuid4().int)[:6]
        send_otp_email(email, otp)
        otp_token = generate_otp_jwt(email,otp)
        encrypted_token = encrypt_jwt(otp_token)
        response.set_cookie(
            key="reset_password_token",
            value = encrypted_token,
            max_age=600,
            httponly=True,
            secure=False,
            samesite="Lax"
        )
        print(response.headers)
        return {
            "message" : "OTP Sent Successfully",
            "token" : encrypted_token
        }

@router.put("/reset-password")
async def reset_password(
    response:Response,
    data: ResetPasswordRequest,
    reset_password_token: str | None = Cookie(None)
):

    entered_otp = data.entered_otp
    newPassword = data.new_password
    if not reset_password_token:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="OTP token missing in cookies"
        )
    otp_token = decrypt_jwt(reset_password_token)
    token_data = verify_otp_type(
        token=otp_token,
        otp=entered_otp
    )
    email = verify_token(token_data)
    userData = check_user_present(email)
    if not userData:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="No User Exists With This Email")
    else:
        if not re.fullmatch(PASSWORD_REGEX, newPassword):
            raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")

        hashedPassword = hashPass(newPassword)
        try:
            db.table("users").update({"password": hashedPassword}).eq("email", email).execute()
            response.delete_cookie("reset_password_token")
            return{
                "message" : "Password Updated Successfully"
            }
        except:
            raise HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT,detail="Error Ocurred While Updating Password")

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {
        "message": "User logged out successfully"
    }
