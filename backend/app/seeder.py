from sqlmodel import Session
from app.db import engine, create_db_and_tables
from app.models import Document, Deck, Flashcard, AnswerLog

create_db_and_tables()

with Session(engine) as session:
    document = Document(
        filename="calculus_notes.pdf",
        file_type="pdf",
        title="Calculus I - Limits and Derivatives",
        category="mathematics"
    )

    session.add(document)
    session.commit()
    session.refresh(document)

    deck = Deck(
        document_id=document.id,
        title="Limits Basics",
        category="mathematics"
    )

    session.add(deck)
    session.commit()
    session.refresh(deck)

    flashcard = Flashcard(
        deck_id=deck.id,
        index=1,
        question="What is the definition of a limit?",
        answer="The value a function approaches as the input approaches some value.",
        difficulty="medium",
        feedback="quick"
    )

    session.add(flashcard)
    session.commit()
    session.refresh(flashcard)

    log = AnswerLog(flashcard_id=flashcard.id)

    session.add(log)
    session.commit()
    session.refresh(log)

    print("Seeding complete!")
    print("Document:", document.id)
    print("Deck:", deck.id)
    print("Flashcard:", flashcard.id)
    print("AnswerLog:", log.id)