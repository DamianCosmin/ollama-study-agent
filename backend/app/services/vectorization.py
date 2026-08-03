from sqlmodel import Session
import uuid
import asyncio

from app.models import Document
from app.websockets import ws_manager
from app.db import engine
from app.services.extraction import extract_text
from app.services.categorization import categorize_document
from app.services.chunking import chunk_text, add_chunks_metadata
from app.services.embedding import create_embeddings
from app.services.chromadb_storage import save_chunks

def process_pipeline(document_id: str, file_type: str, file_path: str):
    # 1: Text extraction & categorization
    extracted_text, nr_pages = extract_text(file_type, file_path)
    category = categorize_document(extracted_text)

    # 2: Chunking
    chunks = chunk_text(extracted_text)
    chunk_records = add_chunks_metadata(document_id, chunks)

    # 3: Embeddings
    embedded_chunks = create_embeddings(chunk_records)

    # 4: ChromaDB store
    save_chunks(embedded_chunks)

    return nr_pages, category

async def vectorize_document(document_id: uuid.UUID, file_path: str):
    with Session(engine) as session:
        document = session.get(Document, document_id)

        if not document:
            return
        
        file_type = document.file_type

    try:
        # Runs document processing in a background thread to avoid blocking the main event loop
        nr_pages, category = await asyncio.to_thread(
            process_pipeline, str(document_id), file_type, file_path
        )
    
        final_status = "success"
        final_nr_pages = nr_pages
        final_category = category
    except Exception as e:
        print(f"Vectorization failed for {document_id}: {e}")
        final_status = "error"
        final_nr_pages = 0
        final_category = "general"

    with Session(engine) as session:
        document = session.get(Document, document_id)
        if document:
            document.status = final_status
            document.nr_pages = final_nr_pages
            document.category = final_category
            session.add(document)
            session.commit()

    try:
        await ws_manager.broadcast({
            "documentId": str(document_id),
            "status": final_status,
            "pages": str(final_nr_pages)
        })
    except Exception as e:
        print(f"Broadcast failed for {document_id}: {e}")