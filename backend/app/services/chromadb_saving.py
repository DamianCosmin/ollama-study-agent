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