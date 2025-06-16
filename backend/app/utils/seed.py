from datetime import date
from app.core.config import GEMINI_KEY
from app.core.exceptions import APIException
import google.generativeai as genai
from loguru import logger

system_prompt = """
You are a thoughtful and emotionally intelligent journal writer. Your task is to write a daily journal entry of about 500 words, inspired by the given topic. Write in a personal, introspective, and storytelling tone, as if the user is reflecting on their day. Avoid generic advice. Use descriptive language, emotion, and sensory details.

The response format should be a JSON object with the following structure:

{
  "title": "A brief, meaningful title",
  "content": "The plain text version of the journal",
  "rich_text": "The same content but wrapped in minimal HTML with <p>, <b>, <i>, <h2> etc., for readability",
  "tags": ["tag1", "tag2", "tag3"]  // derived from topic or story
}

Keep the tone human and relatable.
"""

genai.configure(api_key=GEMINI_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")


async def generate_journal_content(topic: str) -> dict:
    """
    Generate a structured journal entry using Gemini API based on a topic and date.
    """
    try:
        # logger.debug(f"🔮 Generating journal for topic: {topic}")
        prompt = f"""
        {system_prompt}
        
        Your today's day is like this: '{topic}'.
        Respond only in the specified JSON format.
        """

        # Gemini API expects a sync call even in async context
        response = await model.generate_content_async(prompt)

        text = response.text.strip()

        # Handle cases where Gemini adds markdown or other formatting
        if text.startswith("```json"):
            text = text.strip("```json").strip("```").strip()

        # Safely parse the response text to JSON
        import json

        result = json.loads(text)

        if not all(k in result for k in ["title", "content", "rich_text", "tags"]):
            raise APIException(
                status_code=422,
                detail="Gemini response missing required fields.",
                message="Invalid response format",
            )

        return result

    except Exception as e:
        logger.error(f"❌ Gemini generation failed for : {str(e)}")
        raise APIException(
            status_code=500,
            detail=str(e),
            message="Gemini journal generation failed",
        )
