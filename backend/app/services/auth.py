from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from app.core.config import jwtSecret, jwtAlgorithm
from jose import jwt,JWTError
from datetime import datetime, timedelta,timezone
from typing import List

from app.db.schemas.user import UserInDB
from fastapi import HTTPException,Depends,status


passlibContext = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashPass(password: str):
    return passlibContext.hash(password)


def verify(password: str, hashed: str):
    return passlibContext.verify(password, hashed)


def getToken(data: dict,jwtSecret: str,jwtAlgorithm: str):
    return jwt.encode(data, jwtSecret, algorithm=jwtAlgorithm)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def authMiddleware (token : str = Depends(oauth2_scheme)):
    exception  = HTTPException(
       status_code= 401 ,
       detail="Could not validate credentials",
       headers={"WWW-Authenticate":"Bearer"}
    )
    try:
       payload = jwt.decode(token, jwtSecret, algorithms=[jwtAlgorithm])
       username: str = payload.get("sub")
       if username is None:
           raise exception
    except JWTError:
        raise exception
    return username



def createToken(data: UserInDB,expire : timedelta = None):
    toEncode = {
        "email" : data.email
    }
    expireIn = datetime.now(datetime.timezone.utc) + (expire if expire else timedelta(minutes=300))
    toEncode.update({"exp": expireIn})
    encodeJwt = jwt.encode(toEncode,jwtSecret,jwtAlgorithm)
    print(encodeJwt)
    return encodeJwt
    
