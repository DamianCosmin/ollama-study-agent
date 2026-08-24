from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, delete
from pydantic import BaseModel
from typing import Optional
import uuid
import asyncio

from app.db import get_session
from app.models import ChatMessage, ChatSession, User
from app.services.embedding import embed_user_question
from app.services.chromadb_storage import query_related_documents
from app.services.ollama_service import generate_question_answer, generate_session_title

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    sessionId: Optional[str] = None
    userId: str

async def generate_answer(question: str, message_history: list[dict]):
    # Generate vector embedding for the user's question
    embedding = await embed_user_question(question)

    # Retrieve semantic context from ChromaDB
    context = await asyncio.to_thread(query_related_documents, embedding, 3) 

    # Compute LLM answer with extracted data
    answer = await generate_question_answer(question, context, message_history)

    return answer

@router.post("/api/chat")
async def send_chat(chat_body: ChatRequest, session: Session = Depends(get_session)):
    try:
        user_id = uuid.UUID(chat_body.userId)
        session_id = uuid.UUID(chat_body.sessionId) if chat_body.sessionId else None
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Invalid format for user ID or session ID"
        )

    try:
        if session_id:
            chat_session = session.get(ChatSession, session_id)

            if not chat_session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Chat session not found!"
                )
        else:
            # Generate session title from question
            generated_title = await generate_session_title(chat_body.question)

            # Create ChatMessage for user question 
            new_chat_session = ChatSession(
                user_id=user_id,
                title=generated_title
            )

            session.add(new_chat_session)

            chat_session = new_chat_session

        statement = (
            select(ChatMessage)
            .where(ChatMessage.session_id == chat_session.id)
            .order_by(ChatMessage.created_at.asc())
        )

        message_history = session.exec(statement).all()
        history = [
            {
                "role": message.role,
                "content": message.content
            }
            for message in message_history
        ]

        user_message = ChatMessage(
            session_id=chat_session.id,
            role="user",
            content=chat_body.question
        )

        session.add(user_message)

        answer = await generate_answer(chat_body.question, history)

        # Create ChatMessage for assistant answer
        assistant_message = ChatMessage(
            session_id=chat_session.id,
            role="assistant",
            content=answer
        )

        session.add(assistant_message)
        session.commit()
        session.refresh(assistant_message)
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process question!"
        ) from e

    return {
        "answer": assistant_message
    }

@router.get("/api/chat/users/{user_id}/sessions")
async def get_chat_sessions(user_id: uuid.UUID, session: Session = Depends(get_session)):
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found!"
        )

    statement = (
        select(ChatSession)
        .where(ChatSession.user_id == user_id)
        .order_by(ChatSession.created_at.desc())
    )

    return {
        "sessions": session.exec(statement).all()
    }

@router.get("/api/chat/sessions/{session_id}")
async def get_chat_session(session_id: uuid.UUID, session: Session = Depends(get_session)):
    chat_session = session.get(ChatSession, session_id)

    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found!"
        )

    return {
        "session": chat_session
    }

@router.get("/api/chat/sessions/{session_id}/messages")
async def get_session_messages(session_id: uuid.UUID, session: Session = Depends(get_session)):
    chat_session = session.get(ChatSession, session_id)

    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found!"
        )

    statement = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
    )
 
    return {
        "messages": session.exec(statement).all()
    }

@router.delete("/api/chat/sessions/{session_id}")
async def delete_chat_session(session_id: uuid.UUID, session: Session = Depends(get_session)):
    chat_session = session.get(ChatSession, session_id)

    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found!"
        )

    try:
        statement = delete(ChatMessage).where(ChatMessage.session_id == session_id)
        session.exec(statement)

        session.delete(chat_session)
        session.commit()
    except Exception as e:
        session.rollback()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete chat session!"
        ) from e

    return {
        "sessionId": str(session_id)
    }