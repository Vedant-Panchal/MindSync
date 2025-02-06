from app.core.config import SUPABASE_URL,SUPBASE_KEY
from supabase import create_client,Client

db : Client = create_client(SUPABASE_URL,SUPBASE_KEY)
