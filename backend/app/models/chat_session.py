from sqlmodel import Field
from datetime import datetime, timezone
import uuid
from app.models.base import CamelModel

class ChatSession(CamelModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    title: str | None = Field(default=None)