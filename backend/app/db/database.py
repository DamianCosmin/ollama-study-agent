from sqlmodel import SQLModel, Session, create_engine
from contextlib import contextmanager

DATABASE_URL = "sqlite:///./studyagent.db"
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

@contextmanager
def get_session_context():
    with Session(engine) as session:
        yield session