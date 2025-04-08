from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from app.core.config import JWT_SECRET, JWT_ALGO
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from app.db.schemas.user import CreateOtpType
from fastapi import HTTPException, status
from app.core.exceptions import APIException

passlibContext = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashPass(password: str):
    return passlibContext.hash(password)


def verify_pass(password: str, hashed: str):
    return passlibContext.verify(secret=password, hash=hashed)


def get_token(data: dict, JWT_SECRET: str, JWT_ALGO: str):
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGO)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def create_token(data: CreateOtpType, expire: int):
    toEncode: dict[str, any] = {
        "email": data.email,
        "id": data.id,
        "username": data.username,
    }
    expireIn = datetime.now(timezone.utc) + timedelta(minutes=expire)
    toEncode.update({"exp": expireIn})
    encodeJwt = jwt.encode(toEncode, JWT_SECRET, JWT_ALGO)
    return encodeJwt


def decode_token(token: str):
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return decoded_token
    except jwt.ExpiredSignatureError:
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired"
        )
    except JWTError:
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
