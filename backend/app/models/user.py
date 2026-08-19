from sqlmodel import Field
from datetime import datetime, date, timezone
import uuid
from app.models.base import CamelModel

class User(CamelModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    timezone: str = Field(default="UTC")
    last_active: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    username: str
    target: int = Field(default=25)
    current_streak: int = Field(default=0)
    longest_streak: int = Field(default=0)
    avatar_id: str = Field(default="")