from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select
import os
import shutil
import uuid
import asyncio

from app.models import Document
from app.db import get_session, engine
from app.websockets import ws_manager

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

    background_tasks.add_task(vectorize_document, document.id)

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

@router.websocket("/ws/documents")
async def documents_websocket(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

async def vectorize_document(document_id: uuid.UUID):
    with Session(engine) as session:
        document = session.get(Document, document_id)
        if not document:
            return

        try:
            # TO-DO: Change with actual vectorization logic
            await asyncio.sleep(3)

            document.status = "success"
            document.nr_pages = 100
            session.add(document)
            session.commit()
        except Exception as e:
            print(f"Vectorization failed for {document_id}: {e}")
            document.status = "error"
            document.nr_pages = 0
            session.add(document)
            session.commit()

        try:
            await ws_manager.broadcast({
                "documentId": str(document_id),
                "status": document.status,
                "pages": str(document.nr_pages)
            })
        except Exception as e:
            print(f"Broadcast failed for {document_id}: {e}")