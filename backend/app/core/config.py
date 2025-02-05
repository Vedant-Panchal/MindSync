import dotenv
import os

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPBASE_KEY = os.getenv("SUPABASE_KEY")


