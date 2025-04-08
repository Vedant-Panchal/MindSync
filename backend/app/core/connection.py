from loguru import logger
from redis import Redis
from app.core.config import SUPABASE_URL, SUPBASE_KEY, REDIS_URL, REDIS_PASSWORD
from supabase import create_client, Client

db: Client = create_client(SUPABASE_URL, SUPBASE_KEY)
redis_client: Redis = Redis(
    host=REDIS_URL, password=REDIS_PASSWORD, ssl=True, decode_responses=True
)

if redis_client.ping():
    logger.success("Redis connected successfully🌐")
