// Flashcards
export type FlashcardFeedback = "instant" | "quick" | "slow" | "struggled";

export interface IFlashcard {
  id: string;
  deckId: string;
  index: number;
  question: string;
  answer: string;
  difficulty: string;
  feedbackAnswer?: FlashcardFeedback | null;
};

// Session
export type SessionMode = "study" | "review";

// Decks
export interface IDeckCard {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  createdAt: Date;
  lastAccessed: Date;
  totalCards: number;
  lastAnsweredIndex: number;
};

// Library
export type LibraryCardTag = "Vectorized" | "Extracting concepts" | "Failed to parse";

export interface ILibraryCard {
  id: string;
  title: string;
  uploadDate: Date;
  status: string;
  nrPages: number;
}

// Recent answers
export interface IRecentAnswer {
  id: number;
  question: string;
  deckName: string;
  answerDate: Date;
  difficulty: string;
};
