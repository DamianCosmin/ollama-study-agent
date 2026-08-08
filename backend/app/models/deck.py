from sqlmodel import Field
from datetime import datetime, timezone
import uuid
from app.models.base import CamelModel

class Deck(CamelModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    document_id: uuid.UUID = Field(foreign_key="document.id", index=True)
    title: str
    category: str
    difficulty: str
    status: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_accessed: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    nr_cards: int = Field(default=0)
    last_unanswered: int = Field(default=1)