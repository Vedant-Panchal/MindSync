import os
from dotenv import load_dotenv
load_dotenv()
JWT_ALGO: str = os.getenv("JWT_ALGORITHM")
EXPIRES_IN: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_SECONDS", 0))
JWT_SECRET: str = os.getenv("JWT_SECRET")
SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPBASE_KEY: str = os.getenv("SUPABASE_KEY")
RESEND_KEY:str = os.getenv("RESEND_API_KEY")
OTP_EXPIRY_MINS:int = int(os.getenv("OTP_EXPIRY_MINS"),0)
ENCRYPTION_KEY:str = os.getenv("ENCRYPTION_KEY").encode()
REDIS_URL:str = os.getenv("UPSTASH_REDIS_URL")
REDIS_PASSWORD:str = os.getenv("UPSTASH_REDIS_PASSWORD")
