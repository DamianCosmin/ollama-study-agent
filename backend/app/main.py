from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.db import get_session
from app.models import Document, Deck, Flashcard, AnswerLog

app = FastAPI(title="AI Study Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def test():
    return { "message": "The backend has connected successfully!" }

@app.get("/api/documents") 
def get_documents(session: Session = Depends(get_session)) -> list[Document]:
    statement = select(Document)
    return session.exec(statement).all()

@app.get("/api/decks") 
def get_decks(session: Session = Depends(get_session)) -> list[Deck]:
    statement = select(Deck)
    return session.exec(statement).all()

@app.get("/api/flashcards") 
def get_flashcards(session: Session = Depends(get_session)) -> list[Flashcard]:
    statement = select(Flashcard)
    return session.exec(statement).all()

@app.get("/api/flashcards/recent") 
def get_logs(session: Session = Depends(get_session)) -> list[AnswerLog]:
    statement = select(AnswerLog)
    return session.exec(statement).all()