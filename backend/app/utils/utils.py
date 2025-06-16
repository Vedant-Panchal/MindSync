from datetime import date, datetime, timedelta, timezone
import json
from typing import Awaitable, Dict, List, Optional
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
from collections import Counter
import string


from app.core.exceptions import APIException
from fastapi.concurrency import run_in_threadpool
from app.db.schemas.journal import (
    DraftCreate,
    Journal,
    JournalSection,
)

embedding_model = HuggingFaceEmbeddings(model_name=MODEL_VECTOR)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=20)


mood_classifier = pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions",
    top_k=None,
    truncation=True,
)


async def get_user_by_email(email: EmailStr):
    try:
        response = await run_in_threadpool(
            lambda: db.table("users").select("*").eq("email", email).execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Error occurred while fetching data",
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


def direct_embedding(text: str) -> list:
    chunks = [text]
    embeddings = embedding_model.embed_documents(chunks)
    # print (f"embeddings are {embeddings}")
    return embeddings


def analyze_mood(text: str) -> dict:
    results = mood_classifier(text)
    # print(f"results are {results}")

    if results and isinstance(results, list) and len(results) > 0:
        mood_list = results[0]
    else:
        mood_list = []  # Fallback to empty list if results is empty or malformed
    moods = {
        result["label"]: result["score"] for result in mood_list
    }  # Convert to dict

    moods = {result["label"]: round(result["score"], 4) for result in mood_list}

    # print(f"Moods : {moods}")

    sorted_moods = sorted(moods.items(), key=lambda x: x[1], reverse=True)

    # print(sorted_moods)

    top_three_moods = sorted_moods[:3]

    dominant_mood = sorted_moods[0][0] if sorted_moods else "neutral"
    top_moods = {label: score for label, score in top_three_moods}
    # print(top_moods)
    return {"dominant": dominant_mood, **top_moods}


def submit_draft(user_id: str, journal_date: Optional[str] = None):
    print(f"User ID: {user_id}")
    today = datetime.now(timezone.utc).date()
    today_key = date.today().isoformat()
    if journal_date:
        today_key = journal_date
    print(f"Draft:{user_id}:{today_key}")
    draft_data = redis_client.get(f"Draft:{user_id}:{today_key}")
    print(draft_data)
    if draft_data:
        try:
            journal_id = str(uuid4())
            draft_dict = json.loads(draft_data)
            draft = DraftCreate(**draft_dict)
            logger.info(f"Draft Data: {draft}, User ID: {user_id}")
            chunks = text_splitter.split_text(draft.content)
            combine_embeddings = generate_embedding(draft.content)
            moods = analyze_mood(draft.content)
            section_number = 0

            journal = aggregate_journal(
                chunks,
                user_id,
                str(today),
                combine_embeddings,
                draft.tags,
                journal_id,
                title=draft.title,
                title_embedding=direct_embedding(draft.title),
                rich_text=draft.rich_text,
            )
            data_json = jsonable_encoder(journal)
            print(f"journal data is {data_json}")
            insert_journal(data_json, db)

            for chunk in chunks:
                section = process_draft_chunk(
                    journal_id, chunk, section_number, user_id, today
                )
                section_data = section
                section_number += 1
                id = insert_journal_section(section_data, db)
                logger.info(f"✅ Processed draft for {today} and stored in Supabase")
            redis_client.delete(f"Draft:{user_id}:{today_key}")
            return user_id

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


def insert_journal(journal_data):
    try:
        response = db.table("journals").insert(journal_data).execute()
        if not response.data:
            raise ValueError("Failed to insert journal")
        return response.data[0]["id"]
    except Exception as e:
        logger.error(f"❌ Error inserting journal: {str(e)}")
        raise ValueError(f"Insertion failed: {str(e)}")


def insert_journal_section(section_data: dict):
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
    journal_id: str, chunk: str, section_number: int, user_id: str, date: str
):
    section_id = str(uuid4())
    chunk_moods = analyze_mood(chunk)
    dominant_mood = chunk_moods["dominant"]
    embedding = direct_embedding(chunk)

    section_data = {
        "id": section_id,
        "journal_id": journal_id,  # Will be set after journal creation
        "section_number": section_number,
        "text": chunk,
        "moods": chunk_moods,  # JSONB with all mood scores
        "embedding": embedding[0],  # 384-dimensional vector
        "created_at": date.today().isoformat(),  # date type
    }
    return JournalSection(**section_data)


def aggregate_journal(
    chunks: List[str],
    user_id: str,
    date: str,
    combine_embedding,
    tags,
    journal_id: str,
    title: str,
    title_embedding: list[float],
    rich_text: str,
):
    aggregated_content = " ".join(chunks)
    moods = {}  # Dictionary to store aggregated mood scores

    for chunk in chunks:
        chunk_moods = analyze_mood(chunk)
        for mood, score in chunk_moods.items():
            if mood != "dominant":
                moods[mood] = moods.get(mood, 0) + score

    if moods and chunks:
        num_chunks = len(chunks)
        moods = {mood: round(score / num_chunks, 4) for mood, score in moods.items()}

    if moods:
        sorted_moods = sorted(moods.items(), key=lambda x: x[1], reverse=True)[:3]
        # print(f"Moods is  {sorted_moods}")
        moods = dict(sorted_moods)
    else:
        moods = {"neutral": 0.0}

    journal_moods = moods

    journal_data = {
        "id": journal_id,
        "user_id": user_id,
        "content": aggregated_content,
        "moods": journal_moods,
        "tags": {},  # Optional, can expand later
        "embedding": combine_embedding,
        "tags": tags,
        "embedding": combine_embedding,
        "created_at": date or datetime.now(timezone.utc),
        "title": title,
        "title_embedding": title_embedding[0],
        "rich_text": rich_text,
    }
    # return JournalCreate(**journal_data)
    return Journal(**journal_data)


STOPWORDS = set(
    [
        "i",
        "me",
        "my",
        "myself",
        "we",
        "our",
        "ours",
        "you",
        "your",
        "yours",
        "he",
        "him",
        "his",
        "she",
        "her",
        "it",
        "they",
        "them",
        "this",
        "that",
        "is",
        "am",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "a",
        "an",
        "the",
        "and",
        "but",
        "if",
        "or",
        "because",
        "as",
        "until",
        "while",
        "of",
        "at",
        "by",
        "for",
        "with",
        "about",
        "against",
        "between",
        "into",
        "through",
        "during",
        "before",
        "after",
        "above",
        "below",
        "to",
        "from",
        "up",
        "down",
        "in",
        "out",
        "on",
        "off",
        "over",
        "under",
        "again",
        "further",
        "then",
        "once",
        "here",
        "there",
        "when",
        "where",
        "why",
        "how",
        "all",
        "any",
        "both",
        "each",
        "few",
        "more",
        "most",
        "other",
        "some",
        "such",
        "no",
        "nor",
        "not",
        "only",
        "own",
        "same",
        "so",
        "than",
        "too",
        "very",
        "can",
        "will",
        "just",
        "don",
        "should",
        "now",
    ]
)


def pre_process_journal(text: str):
    words = text.lower().translate(str.maketrans("", "", string.punctuation)).split()
    return [word for word in words if word not in STOPWORDS]
