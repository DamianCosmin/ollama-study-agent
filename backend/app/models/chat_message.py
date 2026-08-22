from sqlmodel import Field
from datetime import datetime, timezone
import uuid
from app.models.base import CamelModel

class ChatMessage(CamelModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    session_id: uuid.UUID = Field(foreign_key="chatsession.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    role: str # "user" | "assistant"
    content: str