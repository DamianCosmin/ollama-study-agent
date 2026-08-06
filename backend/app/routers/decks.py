from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal

from app.services.chromadb_storage import collection

router = APIRouter()

class CreateDeckRequest(BaseModel):
    documentId: str
    difficulty: Literal["easy", "medium", "hard"]
    cardCount: Literal[15, 25, 40]

@router.post("/api/deck")
async def create_deck(deck_info: CreateDeckRequest):
    results = collection.get(
        where={"document_id": deck_info.documentId},
        include=["documents", "embeddings", "metadatas"]
    )

    return {
        "message": "Deck info sent successfully to backend!"
    }
