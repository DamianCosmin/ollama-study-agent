from langchain_text_splitters import RecursiveCharacterTextSplitter
from sklearn.cluster import KMeans
import numpy as np

def chunk_text(extracted_text: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1400,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", "! ", "? ", ", ", ".", "!", "?", ",", " ", ""]
    )

    return splitter.split_text(extracted_text)

def add_chunks_metadata(document_id: str, chunks: list[str]) -> list[dict]:
    chunk_records = []

    for i, chunk in enumerate(chunks):
        record = {
            "id": f"{document_id}_{str(i)}",
            "text": chunk,
            "metadata": {
                "document_id": document_id,
                "chunk_index": i
            }
        }

        chunk_records.append(record)

    return chunk_records

def select_chunks(chunks: list[dict], card_count: int) -> list[dict]:
    if len(chunks) <= card_count:
        return chunks

    embeddings = np.array([c["embedding"] for c in chunks])
    k = min(len(chunks), card_count)

    kmeans = KMeans(n_clusters=k, n_init="auto", random_state=16).fit(embeddings)

    selected = []
    for cluster_id in range(k):
        cluster_indices = np.where(kmeans.labels_ == cluster_id)[0]
        if len(cluster_indices) == 0:
            continue

        centroid = kmeans.cluster_centers_[cluster_id]
        distances = np.linalg.norm(embeddings[cluster_indices] - centroid, axis=1)
        closest_idx = cluster_indices[np.argmin(distances)]
        selected.append(chunks[closest_idx])

    return selected