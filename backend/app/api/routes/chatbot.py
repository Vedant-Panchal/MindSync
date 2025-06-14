from email import message
from fastapi import APIRouter, Request, status, HTTPException
from datetime import date, datetime
from uuid import uuid4
from sqlalchemy import update
from sympy import content
from app.core.config import MODEL_VECTOR
from app.core.exceptions import APIException
from app.db.schemas.journal import ChatbotType, DraftRequest
from app.core.connection import db
from fastapi.encoders import jsonable_encoder
import json
from loguru import logger

from app.utils.otp_utils import (
    delete_data,
    get_history,
    store_draft,
    store_history,
    store_otp,
)
from app.utils.utils import submit_draft
from app.utils.chatbot_utils import (
    final_response,
    get_Chat_data,
    get_journals_by_date,
    # query_function,
    query_parser,
)

router = APIRouter()


@router.post("/start")
async def getQuery(request: Request, user_query: ChatbotType):
    """
    Endpoint to handle chatbot queries. It processes the user's query, retrieves relevant journal data,
    and generates a final response using the `final_response` function.
    """
    logger.info(f"Received chatbot query: {user_query.query}")
    print("Received chatbot query:", user_query.query)
    today = datetime.today().strftime("%Y-%m-%d")
    logger.success("Today : {env} 🌍", env=today)
    try:
        filter_params = query_parser(user_query.query)
        logger.info(f"Parsed filter parameters: {filter_params}")

        user = getattr(request.state, "user", None)

        try:
            history = get_history(user_id=user["id"])
        except APIException as e:
            logger.error(f"Failed to load history: {str(e.message)}")
            history = []

        llm_data = []
        if not filter_params["is_related"] and not filter_params["is_history"]:
            logger.info("Query is not realted to Journals")
            response = {
                "message": "I can only help with questions related to your journals. If you have a query about a specific entry, topic, mood, or time period in your journals, feel free to ask! 😊"
            }
            query_object = {"user_query": user_query.query, "response": response}
            history.append(query_object)
            dumped_history = json.dumps(history)
            store_history(dumped_history, user["id"])
            return response
        if filter_params.get("is_history", False):
            logger.info("Processing history-only query")
            try:
                final_result = final_response(
                    data=llm_data,
                    user_query=user_query.query,
                    history=history,
                    user_id=user["id"],
                    is_history=True,
                )
                return final_result
            except APIException as e:
                logger.exception(f"Error processing history query: {str(e)}")
                raise APIException(
                    status_code=500,
                    detail=str(e.message),
                    message="Error processing history-based query",
                )

        # Process journal query
        logger.info("Processing journal query")
        try:
            # result = query_function(
            #     user["id"],
            #     user_query.query,
            #     filter_params,
            # )

            manual_data = get_Chat_data(user_query.query,user["id"],filter_params)

            # logger.info(f'result is : {result}')
            logger.debug(f"Query function result: {manual_data["data"]}")
        except APIException as e:
            logger.exception(f"Error in query_function: {str(e)}")
            raise APIException(
                status_code=500, detail=str(e), message="Error fetching journal data"
            )

        if manual_data.get("data") and len(manual_data["data"]) > 0:
            for data in manual_data["data"]:
                data_object = {
                    "content": data.get("content", ""),
                    "title": data.get("title", ""),
                    "date": data.get("created_at", ""),
                    "moods": data.get("moods", []),
                    "semantic_result": manual_data.get("Semantic Result", []),
                    "title_search": manual_data.get("title_search", []),
                }
                llm_data.append(data_object)

        try:
            final_result = final_response(
                data=llm_data,
                user_query=user_query.query,
                history=history,
                user_id=user["id"],
                is_history=False,
            )
            return final_result
        except APIException as e:
            logger.exception(f"Error in final_response for journal query: {str(e)}")
            raise APIException(
                status_code=500,
                detail=str(e),
                message="Error generating final response",
            )

    except APIException as e:
        logger.exception(f"Unexpected error in /chatbot: {str(e)}")
        raise APIException(
            status_code=500, detail=str(e), message="An unexpected error occurred"
        )


@router.get("/history")
def get_chat_history(request: Request):
    try:
        user = getattr(request.state, "user", None)
        history = get_history(user["id"])
        if not history:
            return []
        else:
            logger.info(f"Chatbot History is {history}")
            updatedHistory = []
            for i in history:
                user_entry = {"role": "user", "content": i["user_query"]}
                assistant_entry = {
                    "role": "assistant",
                    "content": i["response"]["message"],
                }

                updatedHistory.append(user_entry)
                updatedHistory.append(assistant_entry)

                print(updatedHistory)
            return updatedHistory
    except APIException as e:
        logger.exception(f"Unexpected error in getting chatbot history: {str(e)}")
        raise APIException(
            status_code=500, detail=str(e), message="An unexpected error occurred"
        )


@router.delete("/remove-history")
def remove_history(request: Request):
    """
    Endpoint to remove the chat history for the current user.
    """
    try:
        user = getattr(request.state, "user", None)
        delete_data(user["id"])
    except APIException as e:
        logger.exception(f"Error removing chat history: {str(e)}")
        raise APIException(
            status_code=500,
            detail=str(e),
            message="An unexpected error occurred while removing chat history",
        )
