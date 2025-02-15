import os
from dotenv import load_dotenv
from loguru import logger
import sys
logger.remove()
logger.add(sys.stdout)
load_dotenv()
JWT_ALGO: str = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRES_MINS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINS", 0))
REFRESH_TOKEN_EXPIRES_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 0))
JWT_SECRET: str = os.getenv("JWT_SECRET")
SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPBASE_KEY: str = os.getenv("SUPABASE_KEY")
RESEND_KEY:str = os.getenv("RESEND_API_KEY")
OTP_EXPIRY_MINS:int = int(os.getenv("OTP_EXPIRY_MINS"),0)
ENCRYPTION_KEY:str = os.getenv("ENCRYPTION_KEY").encode()
REDIS_URL:str = os.getenv("UPSTASH_REDIS_URL")
REDIS_PASSWORD:str = os.getenv("UPSTASH_REDIS_PASSWORD")


# Log configuration values
logger.success("JWT Algorithm: {algo} 🔐", algo=JWT_ALGO)
logger.success("Access Token Expiry (mins): {mins} ⏳", mins=ACCESS_TOKEN_EXPIRES_MINS)
logger.success("Refresh Token Expiry (days): {days} ⏳", days=REFRESH_TOKEN_EXPIRES_DAYS)
logger.success("Supabase URL: {url} 🌐", url=SUPABASE_URL)
logger.success("Supabase Key: {key} 🔑", key=SUPBASE_KEY)
logger.success("Resend API Key: {key} 📧", key=RESEND_KEY)
logger.success("OTP Expiry (mins): {mins} ⏳", mins=OTP_EXPIRY_MINS)
logger.success("Redis URL: {url} 🌐", url=REDIS_URL)
logger.success("Redis Password: {password} 🔑", password=REDIS_PASSWORD)

GOOGLE_CLIENT_ID : str = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_SECRET_KEY : str = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_URI : str = os.getenv("GOOGLE_REDIRECT_URI")