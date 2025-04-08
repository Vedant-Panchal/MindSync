from datetime import date, datetime, timedelta, timezone
import json
from typing import Dict, List
from uuid import UUID, uuid4
from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import EmailStr
from torch import embedding
from app.core.connection import db
from app.core.config import MODEL_VECTOR
from transformers import pipeline
from app.core.connection import redis_client
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from loguru import logger


from app.core.exceptions import APIException
from app.db.schemas.journal import (
    DraftCreate,
    Journal,
    JournalCreate,
    JournalSectionCreate,
)


embedding_model = HuggingFaceEmbeddings(model_name=MODEL_VECTOR)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=20)


mood_classifier = pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions",
    top_k=None,
    truncation=True,
)


def get_user_by_email(email: EmailStr):
    try:
        response = db.table("users").select("*").eq("email", email).execute()
        return response.data
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Error Ocurred While Fetching Data",
        )


def generate_embedding(text: str) -> list:
    chunks = text_splitter.split_text(text)
    if not chunks:
        chunks = [text]
    embeddings = embedding_model.embed_documents(chunks)  # List of 384-dim vectors
    avg_embedding = [
        sum(col) / len(col) for col in zip(*embeddings)
    ]  # Average to 384 dimensions
    # print (f"avg embeddings are {avg_embedding}")
    return avg_embedding


def direct_emebedding(text: str) -> list:
    chunks = [text]
    embeddings = embedding_model.embed_documents(chunks)
    print(f"embeddings are {embeddings}")
    return embeddings


def analyze_mood(text: str) -> dict:
    results = mood_classifier(text)  # Get all mood scores
    # print(f"results are {results}")
    # Extract the inner list (assuming results is [[{...}, {...}]])
    if results and isinstance(results, list) and len(results) > 0:
        mood_list = results[0]  # Take the first (and likely only) inner list
    else:
        mood_list = []  # Fallback to empty list if results is empty or malformed
    moods = {
        result["label"]: result["score"] for result in mood_list
    }  # Convert to dict
    sorted_moods = sorted(moods.items(), key=lambda x: x[1], reverse=True)
    top_three_moods = sorted_moods[:3]  # Get top three moods
    dominant_mood = sorted_moods[0][0] if sorted_moods else "neutral"
    top_moods = {label: score for label, score in top_three_moods}
    # print(f"top moods are : {top_moods}")
    return {"dominant": dominant_mood, **top_moods}


def submit_draft():
    today = datetime.now(timezone.utc).date()
    print(today)
    keys = redis_client.keys(f"Draft:*:{today}")
    print(keys)
    if not keys:
        raise APIException(
            status_code=400, detail="NO keys in Redis", message="No Drafts Present"
        )
    for key in keys:
        draft_data = redis_client.get(key)
        if draft_data:
            try:
                draft_dict = json.loads(draft_data)
                draft = DraftCreate(**draft_dict)
                user_id = str(draft.user_id)
                logger.info(f"Draft Data: {draft}, User ID: {user_id}")

                journal_id = str(uuid4())
                combine_embeddings = generate_embedding(draft.content)
                moods = analyze_mood(draft.content)
                tags = {"deeds": "good"}
                print(f"Moods : {moods}")
                print(f"combined embeddings{combine_embeddings}")
                print(f"draft Content : {draft.content}")
                print(f"Journal Id is {journal_id}")
                print(f"user Id is {user_id}")
                journal_data = Journal(
                    id=journal_id,
                    user_id=user_id,
                    text=draft.content,
                    moods=moods,
                    tags=tags,
                    embedding=combine_embeddings,
                    date=draft.date,
                )
                print(f"Data is {journal_data}")
                return journal_data
            except ValueError as ve:
                logger.error(f"Error processing draft: {str(ve)}")
                raise APIException(
                    status_code=400, detail=str(ve), message="Value Error Is Coming"
                )
            except Exception as e:
                logger.error(f"Error processing draft: {str(e)}")
                raise APIException(
                    status_code=400, detail=str(e), message="Exception Is Coming"
                )
    raise APIException(
        status_code=400,
        detail="No valid draft data found",
        message="No Drafts Processed",
    )


# async def process_drafts(redis_client, supabase_client, embedding_model, text_splitter, mood_classifier):
#     yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
#     today = (datetime.now(timezone.utc).date())
#     keys = await redis_client.keys(f"Draft:*:{today}")

#     for key in keys:
#         draft_data = await redis_client.get(key)
#         if draft_data:
#             try:
#                 # Deserialize JSON string back to dict and create DraftCreate
#                 draft_dict = json.loads(draft_data)
#                 draft = DraftCreate(**draft_dict)
#                 user_id = str(draft.user_id)
#                 logger.info(f"Draft Data: {draft}, User ID: {user_id}")

#                 # Chunk the content
#                 chunks = text_splitter.split_text(draft.content)
#                 section_number = 0

#                 # Process each chunk and insert directly
#                 for chunk in chunks:
#                     section, section_id, dominant_mood = process_draft_chunk(
#                         chunk, section_number, user_id, yesterday, embedding_model, text_splitter, mood_classifier
#                     )
#                     section_data = section
#                     insert_journal_section(section_data, supabase_client)
#                     section_number += 1

#                 # Aggregate and insert journal
#                 journal = aggregate_journal(
#                     chunks, user_id, yesterday, embedding_model, text_splitter, mood_classifier
#                 )
#                 data_json = jsonable_encoder(journal)
#                 journal_id = insert_journal(data_json, supabase_client)

#                 # No need to update journal_sections here since they’re already inserted with journal_id
#                 await redis_client.delete(key)
#                 logger.info(f"✅ Processed draft for {yesterday} and stored in Supabase")

#             except ValueError as e:
#                 logger.error(f"❌ Error processing draft for {key}: {str(e)}")
#                 continue  # Skip this draft but continue processing others
#             except Exception as e:
#                 logger.error(f"❌ Unexpected error processing draft for {key}: {str(e)}")
#                 continue

#     return keys


def insert_journal(journal_data, db):
    try:
        response = db.table("journals").insert(journal_data).execute()
        if not response.data:
            raise ValueError("Failed to insert journal")
        return response.data[0]["id"]
    except Exception as e:
        logger.error(f"❌ Error inserting journal: {str(e)}")
        raise ValueError(f"Insertion failed: {str(e)}")


def insert_journal_section(section_data: dict, db):
    try:
        response = (
            db.table("journal_sections")
            .insert(jsonable_encoder(section_data))
            .execute()
        )
        if not response.data:
            raise ValueError("Failed to insert journal section")
        return response.data[0]["id"]
    except Exception as e:
        logger.error(f"❌ Error inserting journal section: {str(e)}")
        raise ValueError(f"Insertion failed: {str(e)}")


def process_draft_chunk(
    chunk: str,
    section_number: int,
    user_id: str,
    date: str,
    embedding_model,
    text_splitter,
    mood_classifier,
):
    section_id = str(uuid4())
    chunk_moods = analyze_mood(chunk)
    dominant_mood = chunk_moods["dominant"]
    embedding = generate_embedding(chunk, embedding_model, text_splitter)

    section_data = {
        "id": section_id,
        "journal_id": None,  # Will be set after journal creation
        "section_number": section_number,
        "text": chunk,
        "moods": chunk_moods,  # JSONB with all mood scores
        "embedding": embedding,  # 384-dimensional vector
        "created_at": date.today().isoformat(),  # date type
    }
    return JournalSectionCreate(**section_data), section_id, dominant_mood


def aggregate_journal(
    chunks: List[str],
    user_id: str,
    date: str,
    embedding_model,
    text_splitter,
    mood_classifier,
):
    aggregated_content = " ".join(chunks)
    moods = {}
    for chunk in chunks:
        chunk_moods = analyze_mood(chunk, mood_classifier)
        for mood, score in chunk_moods.items():
            if mood != "dominant":
                moods[mood] = moods.get(mood, 0) + score

    dominant_journal_mood = max(moods, key=moods.get) if moods else "neutral"
    journal_moods = {"dominant": dominant_journal_mood, "details": moods}

    journal_data = {
        "id": str(uuid4()),
        "user_id": user_id,
        "text": aggregated_content,
        "date": date,  # YYYY-MM-DD
        "moods": journal_moods,
        "tags": {},  # Optional, can expand later
        "embedding": generate_embedding(
            aggregated_content, embedding_model, text_splitter
        ),  # 384 dims
    }
    return JournalCreate(**journal_data)
