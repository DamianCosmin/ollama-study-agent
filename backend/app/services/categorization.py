import ollama
import textwrap

ALLOWED_CATEGORIES = ["mathematics", "sciences", "biology", "anatomy", "computer", "psychology", "literature", "history", "geography", "law", "economics", "arts", "engineering", "agriculture", "general"]

def categorize_document(extracted_text: str):
    sample_text = extracted_text[:2000]

    prompt = textwrap.dedent(f"""
        You are an expert text classifier. Your task is to analyze the provided text and classify 
        it into exactly ONE of the following categories: {", ".join(ALLOWED_CATEGORIES)}. \n
        Rules:
        1. If the text does not clearly fit into any of the specific categories above, you MUST fallback to: general.
        2. Your response must be EXACTLY ONE WORD from the list above, lowercase, no extra whitespace.
        3. DO NOT output any explanations, punctuation, preambles, or markdown formatting. Just the category keyword. \n
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