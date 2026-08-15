from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Literal
from datetime import datetime, timezone
import uuid

from app.db import get_session
from app.models import Deck, Flashcard, AnswerLog

router = APIRouter()

class FeedbackBody(BaseModel):
    feedback: Literal["instant", "quick", "slow", "struggled"]

@router.get("/api/flashcards/recent")
async def get_recent_answers(session: Session = Depends(get_session)):
    statement = (
        select(AnswerLog, Flashcard.question, Flashcard.difficulty, Deck.title)
        .join(Flashcard, AnswerLog.flashcard_id == Flashcard.id)
        .join(Deck, AnswerLog.deck_id == Deck.id)
        .order_by(AnswerLog.answer_date.desc())
        .limit(3)
    )
    results = session.exec(statement).all()

    answers = [
        {
            "id": str(log.id),
            "flashcardId": str(log.flashcard_id),
            "deckId": str(log.deck_id),
            "question": question,
            "deckTitle": deck_title,
            "difficulty": difficulty,
            "answerDate": str(log.answer_date),
        }
        for log, question, difficulty, deck_title in results
    ]

    return {
        "answers": answers
    }

@router.get("/api/flashcards/{deck_id}")
async def get_deck_flashcards(deck_id: uuid.UUID, session: Session = Depends(get_session)):
    deck = session.get(Deck, deck_id)

    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deck related to flashcards not found!"
        )

    statement = select(Flashcard).where(Flashcard.deck_id == deck_id)
    flashcards = session.exec(statement).all()

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

    try:
        flashcard.feedback = str(feedback_body.feedback)
        deck.last_unanswered += 1
        deck.last_accessed = datetime.now(timezone.utc)

        log = AnswerLog(
            flashcard_id=flashcard_id,
            deck_id=deck.id,
        )

        session.add(log)
        session.commit()
        session.refresh(flashcard)
    except Exception as e:
        session.rollback()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit feedback!"
        ) from e

    return {
        "flashcard": flashcard
    }