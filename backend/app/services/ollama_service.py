import ollama
import textwrap
import json

ollama_aync_client = ollama.AsyncClient(host="http://localhost:11434")
ALLOWED_CATEGORIES = ["mathematics", "sciences", "biology", "anatomy", "computer", "psychology", "literature", "history", "geography", "law", "economics", "arts", "engineering", "agriculture", "general"]

DIFFICULTY_INSTRUCTIONS = {
    "easy": "Ask straightforward recall questions about definitions or facts explicitly stated in the text.",
    "medium": "Ask questions that require understanding a relationship or process described in the text.",
    "hard": "Ask questions that require synthesizing multiple ideas or reasoning about implications, not just recall.",
}

def categorize_document(extracted_text: str):
    sample_text = extracted_text[:2000]

    prompt = textwrap.dedent(f"""
        You are an expert text classifier. Your task is to analyze the provided text and classify 
        it into exactly ONE of the following categories: {", ".join(ALLOWED_CATEGORIES)}.

        Rules:
        1. If the text does not clearly fit into any of the specific categories above, you MUST fallback to: general.
        2. Your response must be EXACTLY ONE WORD from the list above, lowercase, no extra whitespace.
        3. DO NOT output any explanations, punctuation, preambles, or markdown formatting. Just the category keyword.

        Text to classify:
        {sample_text}
    """).strip()

    try:
        response = ollama.chat(
            model='qwen2.5:7b-instruct',
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            options={
                "temperature": 0
            }
        )

        category = response["message"]["content"].strip().lower()
    except Exception as e:
        print(f"Categorization failed: {e}")
        return "general"

    if category not in ALLOWED_CATEGORIES:
        return "general"

    return category

# TO-DO: Add a function for title generation after the entire flashcard processing is complete
async def generate_cards_from_chunk(chunk_text: str, difficulty: str, cards_per_chunk: int):
    prompt = textwrap.dedent(f"""
        You are a professional flashcards generator. Your task is to generate up to 
        {cards_per_chunk} flashcard(s) from the text below for a study app.

        Rules:
        1. Respect the difficulty instructions: {DIFFICULTY_INSTRUCTIONS[difficulty]}
        2. Length: Questions must be under 50 words. Answers must have maximum 30 words.
        3. Relevance: Use ONLY the provided text. If the text lacks substantive facts, return fewer cards or an empty array: [].
        4. Format: Your entire response must be a single JSON array - NOT an object, NOT wrapped in any key.
        Example of the exact shape required: [{{"question": "...", "answer": "..."}}]
        If you generate zero cards, respond with exactly: []

        Text used for generation:
        {chunk_text}

    """).strip()

    response = await ollama_aync_client.generate(
        model='qwen2.5:7b-instruct',
        prompt=prompt,
        stream=False
    )

    try:
        cards = json.loads(response["response"])
        return cards if isinstance(cards, list) else []
    except json.JSONDecodeError:
        return []