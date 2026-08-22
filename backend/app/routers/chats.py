from fastapi import APIRouter, Depends
from sqlmodel import Session
from pydantic import BaseModel

from app.db import get_session
from app.models import ChatMessage, ChatSession

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    sessionId: str
    userId: str

@router.post("/api/chat")
async def send_chat(chat_body: ChatRequest, session: Session = Depends(get_session)):
    # TO-DOs
    # 1: Create ChatMessage with user question
    # 2: Embed question & message history
    # 3: Query ChromaDB
    # 4: Compute LLM answer
    # 5: Create ChatMessage with LLM answer
    # 6: Send answer to client

    return {
        "answer": "Test chat was sent successfully!"
    }