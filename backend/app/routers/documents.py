from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select
import os
import shutil
import uuid

from app.models import Document
from app.db import get_session
from app.websockets import ws_manager
from app.services import vectorize_document
from app.services.chromadb_storage import delete_data, get_all_data, delete_all_data

router = APIRouter()

UPLOAD_DIRECTORY = "./app/uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
}

@router.post("/api/documents")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Error: Only PDF, DOCX, and PPTX are allowed!",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Error: File exceeds 20 MB limit!",
        )

    await file.seek(0)

    document_id = uuid.uuid4()
    file_type = ALLOWED_TYPES[file.content_type]
    storage_filename = f"{document_id}.{file_type}"
    file_path = os.path.join(UPLOAD_DIRECTORY, storage_filename)

    try:
        with open(file_path, "wb") as dest_file:
            shutil.copyfileobj(file.file, dest_file)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
    finally:
        file.file.close()

    document = Document(
        id=document_id,
        filename=file.filename,
        file_type=file_type,
        title=file.filename,
        category="general",
    )

    session.add(document)
    session.commit()
    session.refresh(document)

    background_tasks.add_task(vectorize_document, document.id, file_path)

    return {
        "message": "Upload successful!",
        "document": document
    }

@router.get("/api/documents")
async def get_documents(session: Session = Depends(get_session)):
    statement = select(Document)

    return {
        "documents": session.exec(statement).all()
    }

@router.get("/api/documents/{document_id}")
async def get_document(document_id: uuid.UUID, session: Session = Depends(get_session)):
    document = session.get(Document, document_id)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found!"
        )
    
    return {
        "document": document
    }

@router.delete("/api/documents/{document_id}")
async def delete_document(document_id: uuid.UUID, session: Session = Depends(get_session)):
    document = session.get(Document, document_id)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found!"
        )

    # Delete files
    storage_filename = f"{document.id}.{document.file_type}"
    file_path = os.path.join(UPLOAD_DIRECTORY, storage_filename)

    if os.path.exists(file_path):
        os.remove(file_path)

    # Delete Chroma DB data
    try:
        delete_data(str(document_id))
    except Exception as e:
        print(f"ChromaDB cleanup failed for {str(document_id)}: {str(e)}")

    # TO_DO: Delete related decks
    # TO-DO: Delete related flashcards
    
    session.delete(document)
    session.commit()

    return {
        "documentId": document_id
    }

@router.websocket("/ws/documents")
async def documents_websocket(websocket: WebSocket):
    await ws_manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

# Testing purposes only
@router.get("/api/debug/chromadb")
async def debug_chroma():
    return get_all_data()

@router.delete("/api/debug/delete-chromadb")
async def delete_chroma():
    delete_all_data()
    
    return {
        "Message": "ChromaDB data deleted successfully!"
    }