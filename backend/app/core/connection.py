from supabase import create_client,Client
from config import SUPABASE_URL,SUPBASE_KEY

db : Client = create_client(SUPABASE_URL,SUPBASE_KEY)
