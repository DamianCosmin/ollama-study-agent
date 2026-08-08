// API
export const API_BASE = "http://localhost:8000/api";
export const WS_BASE = "ws://localhost:8000/ws";

// Flashcards
export type FlashcardFeedback = "instant" | "quick" | "slow" | "struggled";

export interface IFlashcard {
  id: string;
  deckId: string;
  index: number;
  question: string;
  answer: string;
  difficulty: string;
  feedback?: FlashcardFeedback | null;
};

// Session
export type SessionMode = "study" | "review";

// Decks
export interface IDeckCard {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  status: string;
  createdAt: Date;
  lastAccessed: Date;
  totalCards: number;
  lastToAnswer: number;
};

export type DeckCardCount = 15 | 25 | 40;
export type DeckDifficulty = "easy" | "medium" | "hard";

// Library
export type LibraryCardTag = "Vectorized" | "Extracting concepts" | "Failed to parse";

export interface ILibraryCard {
  id: string;
  title: string;
  uploadDate: Date;
  status: string;
  nrPages: number;
  category: string;
};

// Recent answers
export interface IRecentAnswer {
  id: number;
  question: string;
  deckName: string;
  answerDate: Date;
  difficulty: string;
};

// Pop-up
export interface IPopupStatus {
  text: string;
  type: "success" | "error";
}
