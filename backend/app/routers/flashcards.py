from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Literal
from datetime import datetime, timezone
import uuid

from app.db import get_session
from app.models import Deck, Flashcard

router = APIRouter()

class FeedbackBody(BaseModel):
    feedback: Literal["instant", "quick", "slow", "struggled"]

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

@router.patch("/api/flashcards/{flashcard_id}")
async def submit_card_feedback(flashcard_id: uuid.UUID, feedback_body: FeedbackBody, session: Session = Depends(get_session)):
    flashcard = session.get(Flashcard, flashcard_id)

    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found!"
        )

    deck = session.get(Deck, flashcard.deck_id)

    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deck related to flashcard {str(flashcard_id)} not found!"
        )

    flashcard.feedback = str(feedback_body.feedback)
    deck.last_unanswered += 1
    deck.last_accessed = datetime.now(timezone.utc)

    # TO-DO: Create log (recent answer)

    session.commit()
    session.refresh(flashcard)

    return {
        "flashcard": flashcard
    }