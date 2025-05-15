from datetime import datetime
import json
import re
from urllib import response
import dateparser
import google.generativeai as genai
from loguru import logger
from pydantic import BaseModel
from sympy import false

from app.core.config import GEMINI_KEY
from app.core.connection import db
from app.core.exceptions import APIException
from app.utils.utils import direct_embedding
from app.utils.otp_utils import store_history

safety = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_LOW_AND_ABOVE"},
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
]


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
genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel("gemini-2.5-flash-preview-04-17", safety_settings=safety)


today = datetime.today().strftime("%Y-%m-%d")


def query_parser(user_query: str):
    prompt = f"""
    You are a helpful assistant for an AI journaling app.
    Your job is to parse a user’s natural language query and any accompanying recollections into structured JSON to help the app search journal entries or determine if the query is purely conversational.
    Return ONLY JSON with these keys:
    1. "date_range": {{"start": "...", "end": "..."}} — extract any specific or relative time references like "last month", "yesterday", "April 6", etc. Use today’s date as: {today}
    2. "moods": List of relevant emotions from this list (account for negation): {GO_EMOTION_LABELS}
    3. "tags": Any related tags such as activities (e.g. study, code, work), subjects (e.g. networks), people (e.g. classmates, teacher), or contexts (e.g. class, lecture, exam). Use **present tense** for activities and ensure that any verb forms like "working" are replaced by the correct noun form like "work". Give it in **singular** form where applicable.
    4. "title" : Provide a concise one-sentence title based on the user’s query that accurately captures the core subject for effective semantic search. If the query doesn’t explicitly mention a title, return an empty string.
    5. "is_history": Boolean — Set to true if the query does not involve fetching journal data (e.g., purely conversational queries like "What did I ask earlier?" or "tell me something from previous responses" or "Tell me a joke"), and false if it involves fetching journal data (e.g., mentions dates, moods, tags, titles, or journal-related terms like "show", "filter", "find").
    6. "is_related" : Boolean - Set false if you think user query is not related to journal for example "a mathematics equation","a programming problem" until explicitly mentioned to do journal related task with it

    Respond with valid JSON only.

    Query and recall: "{user_query}"
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
        return {}
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

        response = query.execute()
        data = response.data

        # print(data)

        # if not data:
        #     raise APIException(
        #         status_code=404,
        #         detail="No journals found in given date range",
        #         message="No Journal Found"
        #     )

        return data

    except Exception as e:
        raise APIException(
            status_code=500, detail=str(e), message="Error fetching journals"
        )


def filter_by_title(title: str, journal_ids: list):
    try:
        if not journal_ids or len(journal_ids) == 0:
            return []
        title_embedding = direct_embedding(title)

        # print(f"single array is ${title_embedding[0]}")

        response = db.rpc(
            "match_journal_sections",
            {
                "query_embedding": title_embedding[0],
                "journal_ids": journal_ids,
                "match_count": 5,
            },
        ).execute()

        # if isinstance(response, list):
        #     return response
        # else:
        #     final_list = [response]
        #     return final_list

        # filter_ids = []
        # for i in response:
        #     filter_ids.append(i['id'])
        # return filter_ids
        return response

    except Exception as e:
        raise APIException(
            status_code=500, detail=str(e), message="Error fetching journals"
        )


def filter_by_embeddings(topic: str, journal_ids: list):
    try:
        if not journal_ids or len(journal_ids) == 0:
            return []
        topic_embedding = direct_embedding(topic)

        # print(f"single array is ${topic_embedding[0]}")

        response = db.rpc(
            "match_journal_sections",
            {
                "query_embedding": topic_embedding[0],
                "journal_ids": journal_ids,
                "match_count": 5,
            },
        ).execute()
        # filter_ids = []
        # for i in response:
        #     filter_ids.append(i['id'])
        # return filter_ids

        return response

    except Exception as e:
        raise APIException(
            status_code=500,
            detail=str(e),
            message="Error fetching journals by semantic Search",
        )


def filter_by_moods(data, moods: list):
    try:
        if len(moods) == 0:
            return data
        filter_data = []
        for j in moods:
            for i in data:
                mood_list = list(i["moods"].keys())
                if j in mood_list:
                    if i not in filter_data:
                        filter_data.append(i)

        #   if len(filter_data) == 0:
        #       return data
        return filter_data

    except Exception as e:
        raise APIException(
            status_code=500,
            detail=str(e),
            message="Error while fetching journals by moods",
        )


def filter_by_tags(tags: list, data):
    try:
        if not tags or len(tags) == 0:
            return data

        filter_data = []

        for tag in tags:
            for i in data:
                if tag in i["tags"]:
                    if i not in filter_data:
                        filter_data.append(i)
        if len(filter_data) == 0:
            return data
        return filter_data

    except Exception as e:
        raise APIException(
            status_code=500,
            detail=str(e),
            message="Error while fetching journals by tags",
        )


# Define tools
tools = [
    {
        "function_declarations": [
            {
                "name": "get_journals_by_date",
                "description": "Fetch journal entries for a specific user within a date range. Always run this first to filter by date.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "The ID of the user querying their journals.",
                        },
                        "start_date": {
                            "type": "string",
                            "description": "Start date in ISO format (e.g., '2025-04-06') or relative term (e.g., 'yesterday').",
                        },
                        "end_date": {
                            "type": "string",
                            "description": "End date in ISO format (e.g., '2025-04-06') or relative term (e.g., 'today').",
                        },
                    },
                    "required": ["user_id"],
                },
            },
            {
                "name": "filter_by_title",
                "description": "Filter journals semantically based on a title using title embeddings.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "The title to search for (e.g., 'Cricket Match').",
                        },
                        "journal_ids": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of journal IDs to filter.",
                        },
                    },
                    "required": ["title", "journal_ids"],
                },
            },
            {
                "name": "filter_by_embeddings",
                "description": "Filter journals semantically based on a user_query using embeddings.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "topic": {
                            "type": "string",
                            "description": "The main subject or topic to search for (e.g., 'work', 'cricket').",
                        },
                        "journal_ids": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of journal IDs to filter.",
                        },
                    },
                    "required": ["topic", "journal_ids"],
                },
            },
            {
                "name": "filter_by_moods",
                "description": "Filter journals based on a list of moods.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "moods": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of moods to filter by (e.g., ['joy', 'sadness']).",
                        },
                        "data": {
                            "type": "array",
                            "items": {"type": "object"},
                            "description": "List of journal entries to filter.",
                        },
                    },
                    "required": ["data"],
                },
            },
            {
                "name": "filter_by_tags",
                "description": "Filter journals based on a list of tags.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of tags to filter by (e.g., ['work', 'park']).",
                        },
                        "data": {
                            "type": "array",
                            "items": {"type": "object"},
                            "description": "List of journal entries to filter.",
                        },
                    },
                    "required": ["data"],
                },
            },
        ]
    }
]

model = genai.GenerativeModel("gemini-2.5-flash-preview-04-17", tools=tools)


def query_function(user_id: str, user_query: str, filter_parameters):

    # Prepare prompt with filter_parameters and user_id
    # filter_params_str = str(filter_parameters if filter_parameters else {})
    prompt = f"""
    Use filter_parameters ({filter_parameters}) and 
    user_id ({user_id}) as arguments, 
    and appropriate functions to fetch and filter journal data. 
    Always start with get_journals_by_date to filter by date using the date_range.start and date_range.end, 
    then apply other filters (filter_by_title, filter_by_embeddings, filter_by_moods, filter_by_tags) 
    as needed based on the query and filter_parameters. 
    Respond naturally with the results: {user_query}. 
    The response should return only the filtered journal entries based on the parsed query."""

    try:
        # Generate content with function calling
        response = model.generate_content(contents=prompt, tools=tools)
        logger.debug(f"response is this : {response}")
        # Extract function calls from the response
        function_calls = response.candidates[0].content.parts

        journals = []
        current_data = []
        semantic_result = []
        title_result = []

        date_called = False
        for part in function_calls:
            if part.function_call:
                function_name = part.function_call.name
                args = part.function_call.args

                if function_name == "get_journals_by_date" and not date_called:
                    start_date = args.get(
                        "start_date",
                        (
                            filter_parameters.get("date_range", {}).get("start")
                            if filter_parameters
                            else None
                        ),
                    )
                    end_date = args.get(
                        "end_date",
                        (
                            filter_parameters.get("date_range", {}).get("end")
                            if filter_parameters
                            else None
                        ),
                    )
                    if start_date and not end_date:
                        end_date = (
                            start_date  # Handle single-day queries if end is missing
                        )
                    journals = get_journals_by_date(user_id, start_date, end_date)
                    current_data = journals
                    date_called = True
                elif date_called:
                    if function_name == "filter_by_title":
                        title = args.get(
                            "title",
                            (
                                filter_parameters.get("title", "")
                                if filter_parameters
                                else (
                                    user_query.split()[-1]
                                    if "titled" in user_query.lower()
                                    else None
                                )
                            ),
                        )
                        journal_ids = (
                            [j["id"] for j in current_data] if current_data else []
                        )
                        if title:
                            title_result = filter_by_title(title, journal_ids)

                    if function_name == "filter_by_embeddings":
                        topic = args.get(
                            "topic",
                            (
                                user_query.split()[-1]
                                if any(
                                    word in user_query.lower()
                                    for word in ["about", "on"]
                                )
                                else user_query
                            ),
                        )
                        journal_ids = (
                            [j["id"] for j in current_data] if current_data else []
                        )
                        semantic_result = filter_by_embeddings(topic, journal_ids)

                    if function_name == "filter_by_moods":
                        moods = args.get("moods", filter_parameters.get("moods", []))
                        current_data = filter_by_moods(current_data, moods)

                    if function_name == "filter_by_tags":
                        tags = args.get("tags", filter_parameters.get("tags", []))
                        current_data = filter_by_tags(tags, current_data)

        # Generate natural language response
        if not current_data:
            response_text = (
                f"Sorry, I couldn’t find any journals matching '{user_query}'."
            )
        elif len(current_data) == 1:
            journal = current_data[0]
            date = journal.get("date", "an unknown date")
            title = journal.get("title", "Untitled")
            text = journal.get("text", "No details available")
            response_text = (
                f"Here’s the journal titled '{title}' you wrote on {date}: {text}"
            )
        else:
            response_text = f"I found multiple journals matching '{user_query}'. Here are the details:\n"
            for journal in current_data:
                date = journal.get("date", "an unknown date")
                title = journal.get("title", "Untitled")
                text = journal.get("text", "No details available")
                response_text += f"- Titled '{title}' on {date}: {text}\n"

        return {
            "message": response_text,
            "data": current_data,
            "Semantic Result": semantic_result,
            "title_search": title_result,
        }

    except APIException as e:
        raise e
    except Exception as e:
        raise APIException(
            status_code=500,
            detail=str(e),
            message="Error processing user query with function calling",
        )


import google.generativeai as genai
from typing import List, Dict, Any, Optional

genai.configure(api_key=GEMINI_KEY)


class ResponseSchema(BaseModel):
    message: str


def final_response(
    data: List[Dict], user_query: str, history: list[Dict], user_id, is_history
) -> Dict[str, Any]:

    transformed = []
    logger.debug(history)
    for entry in history:
        print("this is entry", entry)
        transformed.append({"role": "user", "parts": [{"text": entry["user_query"]}]})
        transformed.append(
            {"role": "model", "parts": [{"text": entry["response"]["message"]}]}
        )

    if is_history:
        if not transformed:  # No history available
            prompt = f"""
            This is the user query = '{user_query}'.
            There is no conversation history available.
            Only respond if the user query is clearly related to journals, journal content, or journal history.
            Respond in JSON format like:
            {{
                "title": "unknown",
                "date": "NA",
                "message": "I don’t have any prior conversation history to base my response on. How can I assist you?"
            }}
            """
        else:
            prompt = f"""
            This is the user query = '{user_query}'.
            Respond to this query using the conversation history provided.
            Only respond if the user query is clearly related to journals, journal content, or journal history.
            Use natural language and incorporate context from the history to answer the query.
            Respond in JSON format like:
            {{
                "title": "Conversation Summary",
                "date": "{today}",
                "message": "your natural language response here"
            }}
            """
    elif not data or len(data) == 0:
        prompt = f"""
        This is the user query = '{user_query}'.
        The journal data is empty.
        Only respond if the user query is clearly related to journals, journal content, or journal history.
        Respond in JSON format like:
        {{
            "title": "unknown",
            "date": "NA",
            "message": "Cannot Understand Your Question, please provide some details"
        }}
        """
    else:
        # logger.debug(data)
        # data_str = "\n".join([f"- Titled '{entry.get('title', 'Untitled')}' on {entry.get('date', 'unknown date')}: {entry.get('text', 'No details available')}" for entry in data])
        prompt = f"""
        You are an intelligent journaling assistant.
        Only respond if the user query is clearly related to journals, journal content, or journal history.
        If the query is unrelated (e.g. about movies, news, random facts), respond with:
        {{
            "message": "I'm here to help with your journal-related questions. This query doesn't seem related to your journals or past entries, so I won't generate a response."
        }}

            When responding to journal-related queries, format your response with proper markdown:

            ### title with descriptive heading related to the query

            **Date:** {today}

            Main content with appropriate markdown formatting:
            - Use **bold** for emphasis
            - Use *italics* for subtle emphasis
            - Use ### for section headings
            - Use bullet points or numbered lists when appropriate
            - Include blockquotes for journal excerpts

            This is the user query = '{user_query}'.
            Respond to this query with the help of this data: {data}.
            Use natural language and incorporate context from the conversation history if available.
            Always ensure the response is properly escaped JSON that can be parsed with json.loads().


            Respond in JSON format like:
        {{
            "title": "unknown",
            "date": "NA",
            "message": "your response here"
        }}

        """

    model = genai.GenerativeModel(
        "gemini-2.5-flash-preview-04-17",
        safety_settings=[
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_LOW_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_LOW_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_LOW_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
        ],
    )

    try:
        transformed = []
        for entry in history:
            # Add user query as a "user" role message
            transformed.append(
                {"role": "user", "parts": [{"text": entry["user_query"]}]}
            )
            # Add response as a "model" role message
            transformed.append(
                {"role": "model", "parts": [{"text": entry["response"]["message"]}]}
            )

        chat = model.start_chat(history=transformed)
        response = chat.send_message(prompt, stream=True)
        full_response = ""
        for chunk in response:
            if chunk.candidates:
                part = chunk.candidates[0].content.parts[0].text
                full_response += part
        # print("before cleaned",full_response)
        cleaned = re.sub(
            r"^```(?:json)?\s*|\s*```$", "", full_response.strip(), flags=re.MULTILINE
        )

        # print("after cleaning ",cleaned)
        parsed = json.loads(cleaned)

        # print(f"after parsing ",parsed)
        if isinstance(parsed, list):
            combined_message = "\n".join(
                [
                    f"{i+1}. {entry['title']} ({entry['date']}): {entry['message']}"
                    for i, entry in enumerate(parsed)
                ]
            )
            print("combined message is", combined_message)
            parsed = {
                "title": "List of Journal Entries",
                "date": str(today),
                "message": combined_message,
            }
        # logger.info(f"this is response : {full_response}")
        print("parsed response is", parsed)
        query_object = {"user_query": user_query, "response": parsed}
        history.append(query_object)
        dumped_history = json.dumps(history)
        store_history(dumped_history, user_id)
        print("parsed response is parse", parsed)
        return {
            "message": parsed,
        }
    except Exception as e:
        raise APIException(
            status_code=500, detail=str(e), message="Error generating final response"
        )
