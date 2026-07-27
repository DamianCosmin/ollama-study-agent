from sqlmodel import Field
import uuid
from app.models.base import CamelModel

class Flashcard(CamelModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    deck_id: uuid.UUID = Field(foreign_key="deck.id", index=True)
    index: int
    question: str
    answer: str
    difficulty: str # "easy" | "medium" | "hard"
    feedback: str # "instant" | "quick" | "slow" | struggled