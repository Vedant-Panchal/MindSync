from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from app.core.config import JWT_SECRET, JWT_ALGO
from jose import jwt,JWTError
from datetime import datetime,timedelta,timezone
from typing import List

from app.db.schemas.user import UserInDB
from fastapi import HTTPException,Depends,status


passlibContext = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashPass(password: str):
    return passlibContext.hash(password)


def verify(password: str, hashed: str):
    return passlibContext.verify(password, hashed)


def getToken(data: dict,JWT_SECRET: str,JWT_ALGO: str):
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGO)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def authMiddleware (token : str = Depends(oauth2_scheme)):
    exception  = HTTPException(
       status_code= 401 ,
       detail="Could not validate credentials",
       headers={"WWW-Authenticate":"Bearer"}
    )
    try:
       payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
       username: str = payload.get("sub")
       if username is None:
           raise exception
    except JWTError:
        raise exception
    return username



def createToken(data: UserInDB,expire : int):
    toEncode = {
        "email" : data.email,
        "id": data.id
    }
    expireIn = datetime.now(timezone.utc) + timedelta(minutes = expire)
    toEncode.update({"exp": expireIn})
    encodeJwt = jwt.encode(toEncode,JWT_SECRET,JWT_ALGO)
    print(encodeJwt)
    return encodeJwt
    
