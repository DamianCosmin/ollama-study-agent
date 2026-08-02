import ollama

def create_embeddings(chunk_records: list[dict]) -> list[dict]:
    texts = [record["text"] for record in chunk_records]

    response = ollama.embed(model='nomic-embed-text', input=texts)
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