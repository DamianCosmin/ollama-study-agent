from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text(extracted_text: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
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