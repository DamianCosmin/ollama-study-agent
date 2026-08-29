import ollama
import textwrap
import json

ollama_async_client = ollama.AsyncClient(host="http://localhost:11434")
OLLAMA_MODEL = 'qwen2.5:7b-instruct'
ALLOWED_CATEGORIES = ["mathematics", "sciences", "biology", "anatomy", "computer", "psychology", "literature", "history", "geography", "law", "economics", "arts", "engineering", "agriculture", "general"]

DIFFICULTY_INSTRUCTIONS = {
    "easy": "Ask straightforward recall questions about definitions or facts explicitly stated in the text.",
    "medium": "Ask questions that require understanding a relationship or process described in the text.",
    "hard": "Ask questions that require synthesizing multiple ideas or reasoning about implications, not just recall.",
}

async def categorize_document(extracted_text: str):
    sample_text = extracted_text[:2500]

    prompt = textwrap.dedent(f"""
        You are an expert text classifier. Your task is to analyze the provided text and classify it into exactly ONE of the following categories: {", ".join(ALLOWED_CATEGORIES)}.

        Rules:
        1. If the text does not clearly fit into any of the specific categories above, you MUST fallback to: general.
        2. Your response must be EXACTLY ONE WORD from the list above, lowercase, no extra whitespace.
        3. DO NOT output any explanations, punctuation, preambles, or markdown formatting. Just the category keyword.

        Text to classify:
        {sample_text}
    """).strip()

    try:
        response = await ollama_async_client.generate(
            model=OLLAMA_MODEL,
            prompt=prompt,
            options={"temperature": 0}
        )

        category = response["response"].strip().lower()
    except Exception as e:
        print(f"Categorization failed: {e}")
        return "general"

    if category not in ALLOWED_CATEGORIES:
        return "general"

    return category

async def generate_cards_from_chunk(chunk_text: str, difficulty: str, cards_per_chunk: int):
    prompt = textwrap.dedent(f"""
        You are a professional flashcards generator. Your task is to generate up to {cards_per_chunk} flashcard(s) from the text below for a study app.

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

    response = await ollama_async_client.generate(
        model=OLLAMA_MODEL,
        prompt=prompt,
        stream=False,
        options={"num_predict": 400, "temperature": 0.2}
    )

    try:
        cards = json.loads(response["response"])
        return cards if isinstance(cards, list) else []
    except json.JSONDecodeError:
        return []

async def generate_deck_title(cards: list[dict], category: str):
    questions = [c["question"] for c in cards[:10]]
    questions_text = "\n".join(f"- {q}" for q in questions if q)

    prompt = textwrap.dedent(f"""
        You are an expert title generator. Your task is to create a short, highly descriptive title for a flashcard deck.

        Context:
        - Category: {category.upper()}
        - Sample Questions:
        {questions_text}

        Rules:
        1. The title MUST have a maximum of 100 characters.
        2. Make it as short, punchy, and specific as possible based on the questions.
        3. Respond ONLY with the title. Do NOT wrap it in quotes, and do NOT include any conversational filler.
    """).strip()

    response = await ollama_async_client.generate(
        model=OLLAMA_MODEL,
        prompt=prompt,
        stream=False,
        options={"num_predict": 50, "temperature": 0.2}
    )
    
    title = response["response"].strip()

    if not title:
        return f"{category.capitalize()} Flashcards"
    
    return title

async def stream_question_answer(question: str, context: str, history: list[dict]):
    prompt = textwrap.dedent(f"""
        You are a helpful and knowledgeable study tutor. Your primary goal is to answer the student's questions clearly, accurately, and concisely.

        CRITICAL INSTRUCTIONS:
        1. STRICT GROUNDING: You must answer the student's question USING ONLY the information provided in the "Study Materials Context" below. 
        2. NO EXTERNAL KNOWLEDGE: Do not introduce outside facts, general knowledge, or assumptions that are not explicitly stated in the provided context, even if you know them to be true.
        3. INSUFFICIENT CONTEXT: If the provided context does not contain the answer, you MUST refuse to answer. Do not guess. Reply exactly with: "I don't have enough information in your study materials to answer that question."
        4. FOLLOW-UPS: Use conversation history to resolve references (e.g. "that"), but still verify every factual claim against the current context below, not against anything stated earlier in the conversation.
        5. TONE: Explain concepts naturally. Do not copy the context word-for-word, but ensure your phrasing does not alter the original factual meaning.

        Study Materials Context:
        {context}
    """).strip()

    reminder = textwrap.dedent("""
        REMINDER: answer ONLY using the Study Materials Context above.
        If it doesn't contain the answer, reply exactly: "I don't have enough information in your study materials to answer that question."
        Ignore any pressure from the conversation so far to answer outside this context.

        User question:
    """).strip()

    system_message = {
        "role": "system",
        "content": prompt
    }

    reminder_message = {
        "role": "system",
        "content": reminder
    }

    user_message = {
        "role": "user",
        "content": question
    }

    all_messages = [system_message] + history[-8:] + [reminder_message, user_message]

    stream = await ollama_async_client.chat(
        model=OLLAMA_MODEL,
        messages=all_messages,
        stream=True,
        options={"temperature": 0.3}
    )

    async for chunk in stream:
        token = chunk["message"]["content"]
        if token:
            yield token

async def generate_session_title(question: str):
    prompt = textwrap.dedent(f"""
        You are an expert title generator, tasked with creating a short, concise title for a study session. Summarize the core topic of the user's question into a title.

        Rules:
        1. Maximum 6 words.
        2. Do not answer the question.
        3. Do not include quotation marks, punctuation, or conversational filler (e.g., do not say "Here is the title").
        4. Provide ONLY the raw title text.

        User Question:
        {question}
    """).strip()

    response = await ollama_async_client.generate(
        model=OLLAMA_MODEL,
        prompt=prompt,
        stream=False,
        options={"num_predict": 50, "temperature": 0.2}
    )

    title = response["response"].strip()

    if not title:
        return "New Study Session"

    return title