# Study Agent

Study Agent is an AI-powered study platform that transforms lecture materials, notes, and documents into structured flashcard decks and provides an interactive tutor for clarifying concepts. The platform is designed around a simple idea: upload what you are studying, let the system extract the relevant knowledge, and spend your time actually learning rather than manually preparing study material.

The application combines document processing, vector search, and local large language models to generate flashcards, track study progress, and answer questions grounded in the user's own materials.

## 📖 How It Works

Using Study Agent is meant to feel simple, even though there is a lot happening behind the scenes.

It starts with uploading a document, such as lecture slides, a PDF handout, or a set of notes. The user does not need to prepare anything in advance. Once the document is uploaded, the platform reads through it on its own and gets it ready to be turned into study material.

From there, the user can create a flashcard deck from that document. They simply choose how difficult the questions should be and roughly how many flashcards they would like, and the platform generates a complete deck automatically, including a fitting title.

Studying a deck feels similar to using a classic set of flashcards, but digital and interactive. Each card shows a question, the user tries to answer it in their head, flips the card to see the correct answer, and rates how well they knew it. This helps the platform keep track of progress, show how many cards are due for review, and build a daily study habit through goals and streaks.

Alongside the flashcards, Study Agent also includes an AI Tutor. This works like a conversation with a study assistant, where the user can ask questions about the topics they are learning and receive clear, contextual answers based specifically on the documents they uploaded, rather than generic information. Past conversations are saved, so the user can always pick up where they left off.

## 🧠 Key Functionalities

**Document Library**  
Users can upload study materials in PDF, DOCX, or PPTX format. Each document is automatically processed in the background: text is extracted, split into chunks, embedded, and stored for later retrieval. Documents are also automatically categorized by subject using a language model, and their processing status is reflected in real time through WebSocket updates.

**Flashcard Deck Generation**  
From any processed document, a user can generate a flashcard deck by selecting a difficulty level (easy, medium, or hard) and a target number of cards. The generation process runs in the background and produces a deck with an automatically generated title, while the user continues using the rest of the application. Generation progress and completion are communicated live to the interface.

**Study Sessions**  
Each deck can be studied through a full-screen, distraction-free session. Cards are presented one at a time with a flip animation revealing the answer, after which the user rates their recall on a simple scale. This information updates the deck's progress and contributes to daily study statistics. Fully completed decks can be revisited in review mode, which allows browsing questions and answers without affecting progress.

**AI Tutor**  
A conversational assistant answers questions using context retrieved from the user's own documents rather than general knowledge alone. Responses are streamed to the interface token by token and rendered with basic markdown formatting, including bold text, italics, and inline code. Conversations are organized into sessions, accessible from a dedicated sidebar, and can be resumed or started fresh at any time.

**Dashboard and Progress Tracking**  
The homepage provides a summary of recently studied decks, quick access to the document library and AI Tutor, and a daily flashcard goal with progress tracking. A dedicated settings page allows the user to update their profile, adjust their daily target, choose an avatar, and view learning statistics such as current and longest study streaks.

**Search and Filtering**  
Both the document library and the deck collection support searching by title alongside a filtering system for narrowing results by category, difficulty, or completion status, combined with sorting options.

**Interface and Design**  
The application follows a consistent dark, glass-like visual theme with cyan and emerald accents throughout every page. The interface is fully responsive, adapting appropriately to both desktop and mobile screen sizes.

## 🖼️ Gallery

A visual gallery showcasing the interface and core features is currently in preparation and will be added to this section soon.

## ⚙️ Tech Stack

**Frontend**  
The client is built with React and TypeScript, styled using Tailwind CSS to maintain the application's dark, glass-inspired theme. Framer Motion is used for interface animations, including page transitions and modal behavior, while React Router handles navigation between views. Chat responses from the AI Tutor are rendered using react-markdown, and icons are provided by Lucide.

**Backend**  
The server is built with FastAPI in Python, using SQLModel on top of SQLite for relational data such as users, documents, decks, flashcards, and chat history. Background tasks handle long-running operations such as document processing and flashcard generation without blocking the main application, and WebSocket connections are used to push real-time status updates to the client.

**Vector Storage and Retrieval**  
Document content is chunked and embedded, then stored in ChromaDB, which is used to retrieve relevant context both for flashcard generation and for answering questions in the AI Tutor.

**Language Models**  
All language model inference runs locally through Ollama. The qwen2.5:7b-instruct model is used for document categorization, flashcard generation, chat responses, and session title generation, while nomic-embed-text is used to compute embeddings for both document chunks and semantic deduplication of generated flashcards. Running models locally avoids reliance on external AI providers and keeps user data on the local machine.

**Supporting Libraries**  
Document chunking is handled using LangChain's text splitting utilities, and scikit-learn's KMeans clustering is used to select a representative sample of content when generating flashcards from larger documents.

## 👨🏻‍💻 Author
Developed with passion by **</ [Damian Cosmin](http://github.com/DamianCosmin) >**