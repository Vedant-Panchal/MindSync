from datetime import datetime
import json
import re
import dateparser
import google.generativeai as genai
from loguru import logger

from app.core.config import GEMINI_KEY
from app.core.connection import db
from app.core.exceptions import APIException


genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel("gemini-1.5-flash-latest")

GO_EMOTION_LABELS = [
    "admiration",
    "amusement",
    "annoyance",
    "approval",
    "caring",
    "confusion",
    "curiosity",
    "desire",
    "disappointment",
    "disapproval",
    "disgust",
    "embarrassment",
    "excitement",
    "fear",
    "gratitude",
    "grief",
    "joy",
    "love",
    "nervousness",
    "optimism",
    "pride",
    "realization",
    "relief",
    "remorse",
    "sadness",
    "surprise",
    "neutral",
]
today = datetime.today().strftime("%Y-%m-%d")


def query_parser(user_query: str):
    prompt = f"""
You are a helpful assistant for an AI journaling app.

Your job is to parse natural language queries into structured JSON so the app can search journal entries.

Return ONLY JSON with these keys:
1. "date_range": {{"start": "...", "end": "..."}} — extract any time references like "last month", "yesterday","last monday","last week" refer today as {today}
2. "topic": main subject or activity in detail for semantic search
3. "semantic_keywords": 3–5 keywords or phrases for semantic search
4. "moods": list of emotions from this list (handle negation): {GO_EMOTION_LABELS}
5. "tags": any related tags mentioned (e.g. college, exam, gym)

Respond with JSON only.

Query: "{user_query}"
"""

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    cleaned = re.sub(
        r"^```(?:json)?\s*|\s*```$", "", raw_text.strip(), flags=re.MULTILINE
    )
    print(f"Cleaned is : {cleaned}")

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        print("⚠️ Failed to parse JSON:\n", cleaned)
        return {}

    # if parsed.get("date_range"):
    #     for key in ["start", "end"]:
    #         if parsed["date_range"].get(key):
    #             dt = dateparser.parse(parsed["date_range"][key])
    #             parsed["date_range"][key] = dt.date().isoformat() if dt else None
    normalized_dates = normalize_date_range(parsed)
    # print(normalized_dates)
    return parsed


def get_journals_by_date(user_id, start_date=None, end_date=None):
    try:
        print("Getting journals by date...")
        query = db.from_("journals").select("*").eq("user_id", user_id)

        # Apply date filters only if provided
        if start_date and end_date:
            print(f"Filtering journals from {start_date} to {end_date}")
            query = query.gte("created_at", start_date).lte("created_at", end_date)
        elif start_date:
            print(f"Filtering journals from {start_date} onwards")
            query = query.gte("created_at", start_date)
        elif end_date:
            print(f"Filtering journals until {end_date}")
            query = query.lte("created_at", end_date)

        # Now execute the final composed query
        response = query.execute()
        data = response.data

        if not data:
            raise APIException(
                status_code=404,
                detail="No journals found in given date range",
                message="No Journal Found",
            )

        return data

    except Exception as e:
        raise APIException(
            status_code=500, detail=str(e), message="Error fetching journals"
        )


def filter_by_embeddings(query: str, data: list):
    try:
        if not data:
            raise APIException(
                status_code=404,
                detail="No journals found in given date range",
                message="No Journal Found",
            )

    except Exception as e:
        raise APIException(
            status_code=500, detail=str(e), message="Error fetching journals"
        )


def normalize_date_range(parsed: dict) -> dict:
    if not parsed.get("date_range"):
        return parsed

    for key in ["start", "end"]:
        value = parsed["date_range"].get(key)
        if value:
            parsed_date = dateparser.parse(
                value,
                settings={
                    "PREFER_DATES_FROM": "past",
                    "RELATIVE_BASE": datetime.now(),
                    "RETURN_AS_TIMEZONE_AWARE": False,
                },
            )
            if parsed_date:
                parsed["date_range"][key] = parsed_date.date().isoformat()
                print(f"✅ Parsed {key} = {parsed['date_range'][key]}")
            else:
                parsed["date_range"][key] = None
                print(f"⚠️ Could not parse {key}: {value}")
        else:
            parsed["date_range"][key] = None

    return parsed
