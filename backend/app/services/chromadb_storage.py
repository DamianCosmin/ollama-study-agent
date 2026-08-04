import chromadb

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("study-agent-documents")

def save_chunks(embedded_chunks: list[dict]):
    collection.add(
        ids=[chunk["id"] for chunk in embedded_chunks],
        embeddings=[chunk["embedding"] for chunk in embedded_chunks],
        documents=[chunk["text"] for chunk in embedded_chunks],
        metadatas=[chunk["metadata"] for chunk in embedded_chunks]
    )

def delete_data(document_id: str):
    collection.delete(where={"document_id": document_id})

# Testing purposes only
def get_all_data():
    result = collection.get(include=["documents", "metadatas", "embeddings"])

    data = []
    for id, metadata, text, embedding in zip(result["ids"], result["metadatas"], result["documents"], result["embeddings"]):
        record = {
            "id": id,
            "metadata": metadata,
            "text": text,
            "embedding_length": len(embedding) if embedding is not None else 0
        }
        data.append(record)

    return data

def delete_all_data():
    client.delete_collection(name="study-agent-documents")