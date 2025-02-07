import os
from dotenv import load_dotenv
load_dotenv()
JWT_ALGO: str = os.getenv("JWT_ALGORITHM")
EXPIRES_IN: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_SECONDS", 0))
JWT_SECRET: str = os.getenv("JWT_SECRET")
SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPBASE_KEY: str = os.getenv("SUPABASE_KEY")
RESEND_KEY:str = os.getenv("RESEND_API_KEY")
OTP_EXPIRY_MINS:int = 10

# print(f"""
#         **********************************

#         **********************************
#         """)