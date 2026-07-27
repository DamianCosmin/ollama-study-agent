from sqlmodel import Field
from datetime import datetime, timezone
import uuid
from typing import Optional
from app.models.base import CamelModel

class AnswerLog(CamelModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    flashcard_id: uuid.UUID = Field(foreign_key="flashcard.id", index=True)
    answer_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))