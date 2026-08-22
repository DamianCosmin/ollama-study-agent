from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from contextlib import asynccontextmanager

from app.db import engine
from app.routers import documents_router, decks_router, flashcards_router, users_router, chats_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(title="AI Study Agent", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router)
app.include_router(decks_router)
app.include_router(flashcards_router)
app.include_router(users_router)
app.include_router(chats_router)

@app.get("/")
def main():
    return { 
        "message": "The backend has connected successfully!"
    }