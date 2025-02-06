
import os
from dotenv import load_dotenv
load_dotenv()
jwtAlgorithm: str = os.getenv("JWT_ALGORITHM")
expiresIn: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
jwtSecret: str = os.getenv("JWT_SECRET")
SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPBASE_KEY: str = os.getenv("SUPABASE_KEY")