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

def query_related_documents(embedding: list[float], n_results: int = 3, max_distance: float = 1.0) -> str:
    result = collection.query(
        query_embeddings=[embedding],
        n_results=n_results,
        include=["documents", "distances"]
    )

    documents = result["documents"][0] if result["documents"] else []
    distances = result["distances"][0] if result["distances"] else []

    related_documents = [
        doc for doc, dist in zip(documents, distances) if dist <= max_distance
    ]
    if not related_documents:
        return ""

    return "\n\n".join(related_documents)

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