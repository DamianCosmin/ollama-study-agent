import ollama
from app.services.ollama_service import ollama_async_client

EMBEDDING_MODEL = 'nomic-embed-text'

def create_embeddings(chunk_records: list[dict]) -> list[dict]:
    texts = [record["text"] for record in chunk_records]

    response = ollama.embed(model=EMBEDDING_MODEL, input=texts)
    embeddings = response["embeddings"]

    if len(embeddings) != len(chunk_records):
        raise ValueError("Mismatch between number of chunks and number of embeddings returned!")

    embedded_chunks = []
    for record, embedding in zip(chunk_records, embeddings):
        new_record = {
            **record,
            "embedding": embedding
        }
        
        embedded_chunks.append(new_record)

    return embedded_chunks

async def embed_flashcard_text(text: str) -> list[float]:
    response = await ollama_async_client.embed(model=EMBEDDING_MODEL, input=text)
    return response["embeddings"][0]

async def embed_user_question(question: str) -> list[float]:
    response = await ollama_async_client.embed(model=EMBEDDING_MODEL, input=question)
    return response["embeddings"][0]