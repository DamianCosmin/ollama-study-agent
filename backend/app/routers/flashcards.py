from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
import uuid

from app.db import get_session
from app.models import Flashcard

router = APIRouter()

@router.get("/api/flashcards/{deck_id}")
async def get_deck_flashcards(deck_id: uuid.UUID, session: Session = Depends(get_session)):
    statement = select(Flashcard).where(Flashcard.deck_id == deck_id)
    flashcards = session.exec(statement).all()

    if not flashcards:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flashcards related to deck {str(deck_id)} not found!"
        )

    return {
        "flashcards": flashcards
    }