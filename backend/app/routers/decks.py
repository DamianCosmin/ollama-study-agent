from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select, delete
from pydantic import BaseModel
from typing import Literal
import asyncio
import uuid
import numpy as np

from app.db import get_session, get_session_context
from app.models import Document, Deck, Flashcard
from app.services.chromadb_storage import collection
from app.services.ollama_service import generate_cards_from_chunk, generate_deck_title
from app.services.chunking import select_chunks
from app.services.embedding import embed_flashcard_text
from app.websockets import decks_ws_manager

router = APIRouter()

class CreateDeckRequest(BaseModel):
    documentId: str
    difficulty: Literal["easy", "medium", "hard"]
    cardCount: Literal[15, 25, 40]

# Generate flashcards from every chunk concurrently
async def generate_flashcards(chunks: list[dict], difficulty: str):
    tasks = [generate_cards_from_chunk(chunk["text"], difficulty, 2) for chunk in chunks]
    results = await asyncio.gather(*tasks)
    return [card for chunk_cards in results for card in chunk_cards]

async def deduplicate_cards(cards: list[dict], similarity_threshold: float = 0.8) -> list[dict]:
    if not cards:
        return []

    # Embed all questions concurrently
    embeddings = await asyncio.gather(*[embed_flashcard_text(card["question"]) for card in cards])

    kept_cards: list[dict] = []
    kept_embeddings: list[list[float]] = []

    for card, emb in zip(cards, embeddings):
        emb_array = np.array(emb)

        if kept_embeddings:
            kept_matrix = np.array(kept_embeddings)

            similarities = kept_matrix @ emb_array / (
                np.linalg.norm(kept_matrix, axis=1) * np.linalg.norm(emb_array)
            )

            # Skip flashcard if it is similar to a card already stored
            if similarities.max() > similarity_threshold:
                continue

        kept_cards.append(card)
        kept_embeddings.append(emb)

    return kept_cards

async def run_deck_generation(deck_info: CreateDeckRequest, deck_id: uuid.UUID, deck_category: str):
    try:
        # Extract document data from ChromaDB
        results = collection.get(
            where={"document_id": deck_info.documentId},
            include=["documents", "embeddings", "metadatas"]
        )

        chunks = [
            {
                "text": doc,
                "embedding": emb,
                "metadata": meta
            }
            for doc, emb, meta in zip(results["documents"], results["embeddings"], results["metadatas"])
        ]

        if not chunks:
            await mark_deck_failed(deck_id)
            return

        # Select representative chunks for better question diversity
        selected_chunks = select_chunks(chunks, deck_info.cardCount)

        # Generate an initial batch of flashcards
        generated_cards = await generate_flashcards(selected_chunks, deck_info.difficulty)

        # Deduplicate cards and keep the desired amount only
        deduped_cards = await deduplicate_cards(generated_cards)

        final_cards = deduped_cards[:deck_info.cardCount]

        if not final_cards:
            await mark_deck_failed(deck_id)
            return

        # Generate a suitable title for the deck based on the questions
        generated_title = await generate_deck_title(final_cards, deck_category)

        # Save all flashcards in DB
        with get_session_context() as session:
            deck = session.get(Deck, deck_id)

            if not deck:
                return

            for idx, card in enumerate(final_cards):
                session.add(Flashcard(
                    deck_id=deck_id,
                    index=idx+1,
                    question=card["question"],
                    answer=card["answer"],
                    difficulty=deck_info.difficulty
                ))

            deck.title = generated_title
            deck.status = "success"
            deck.nr_cards = len(final_cards)
            session.add(deck)
            session.commit()
            session.refresh(deck)

            updated_deck = {
                "id": str(deck_id),
                "title": deck.title,
                "status": deck.status,
                "nrCards": deck.nr_cards
            }

        await safe_broadcast(updated_deck)
    except Exception as e:
        print(f"Deck generation failed for deck {str(deck_id)}: {e}")
        await mark_deck_failed(deck_id)

async def mark_deck_failed(deck_id: uuid.UUID):
    with get_session_context() as session:
        deck = session.get(Deck, deck_id)
        if deck:
            deck.title = "Failed"
            deck.status = "error"
            session.add(deck)
            session.commit()
            session.refresh(deck)

            updated_deck = {
                "id": str(deck_id),
                "title": deck.title,
                "status": deck.status,
                "nrCards": deck.nr_cards
            }
        else:
            return

    await safe_broadcast(updated_deck)

async def safe_broadcast(payload: dict):
    try:
        await decks_ws_manager.broadcast(payload)
    except Exception as e:
        print(f"Broadcast failed for deck {payload.get('id')}: {e}")

@router.post("/api/deck")
async def create_deck(
    background_tasks: BackgroundTasks,
    deck_info: CreateDeckRequest,
    session: Session = Depends(get_session)
):
    try:
        document_id = uuid.UUID(deck_info.documentId)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Invalid document ID format"
        )
    
    # Create deck object and save it in DB
    related_document = session.get(Document, document_id)
    if not related_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document used for generation not found!"
        )

    deck = Deck(
        document_id=document_id,
        title="Generating...",
        category=related_document.category,
        difficulty=deck_info.difficulty,
        status="processing",
    )

    session.add(deck)
    session.commit()
    session.refresh(deck)

    background_tasks.add_task(run_deck_generation, deck_info, deck.id, deck.category)

    return {
        "deck": deck
    }

@router.get("/api/decks")
async def get_decks(session: Session = Depends(get_session)):
    statement = select(Deck)

    return {
        "decks": session.exec(statement).all()
    }

@router.delete("/api/decks/{deck_id}")
async def delete_deck(deck_id: uuid.UUID, session: Session = Depends(get_session)):
    deck = session.get(Deck, deck_id)

    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deck not found!"
        )

    statement = delete(Flashcard).where(Flashcard.deck_id == deck_id)
    session.exec(statement)

    session.delete(deck)
    session.commit()

    return {
        "deckId": deck_id
    }

@router.websocket("/ws/decks")
async def documents_websocket(websocket: WebSocket):
    await decks_ws_manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        decks_ws_manager.disconnect(websocket)