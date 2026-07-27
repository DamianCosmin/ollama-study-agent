from sqlmodel import Field
from datetime import datetime, timezone
import uuid
from app.models.base import CamelModel

class Document(CamelModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    filename: str
    file_type: str # "pdf" | "docx" | "pptx"
    title: str
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = Field(default="processing")
    nr_pages: int = Field(default=0)
    category: str