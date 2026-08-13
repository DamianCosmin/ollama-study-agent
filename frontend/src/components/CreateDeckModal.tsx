import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon, FileTextIcon, LeafIcon, SparklesIcon, FlameIcon, LayersIcon, InfoIcon, type LucideIcon } from "lucide-react";

import { useStatus } from "../context/StatusContext.tsx";
import { API_BASE, ILibraryCard, DeckCardCount, DeckDifficulty, IDeckCard } from "../utils/types.ts";
import { convertToILibraryCard, convertToIDeckCard } from "../utils/functions.ts";


interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deck: IDeckCard) => void;
}

interface DifficultyOption {
  key: DeckDifficulty;
  label: string;
  icon: LucideIcon;
  activeStyle: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { key: "easy", label: "Easy", icon: LeafIcon, activeStyle: "text-emerald-300 bg-emerald-300/10 outline-emerald-300/30" },
  { key: "medium", label: "Medium", icon: SparklesIcon, activeStyle: "text-cyan-300 bg-cyan-300/10 outline-cyan-300/30" },
  { key: "hard", label: "Hard", icon: FlameIcon, activeStyle: "text-red-300 bg-red-300/10 outline-red-300/30" },
];

const CARD_COUNT_OPTIONS: DeckCardCount[] = [15, 25, 40];

export default function CreateDeckModal({isOpen, onClose, onSubmit}: CreateDeckModalProps) {
  const [documents, setDocuments] = useState<ILibraryCard[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<DeckDifficulty | null>(null);
  const [cardCount, setCardCount] = useState<DeckCardCount | null>(null);
  const { showStatus } = useStatus();

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE}/documents`, {
        method: "GET"
      });

      const data = await response.json();

      if (response.ok) {
        const rawData = data.documents as Array<Omit<ILibraryCard, "uploadDate"> & {uploadDate: string}>;
        
        const docs: ILibraryCard[] = rawData
          .map((doc) => convertToILibraryCard(doc))
          .sort((docA, docB) => docB.uploadDate.getTime() - docA.uploadDate.getTime());

        setDocuments(docs);
      } else {
        showStatus({text: "Failed to retrieve documents!", type: "error"});
        console.error("Error: Failed to retrieve documents!");
      }
    } catch (err) {
      showStatus({text: "Could not connect to the backend!", type: "error"});
      console.error("Error: Could not connect to backend!", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments()

      setSelectedDocId(null);
      setDifficulty(null);
      setCardCount(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen)
      return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const canSubmit = selectedDocId && difficulty && cardCount;

  const handleSubmit = async () => {
    if (!canSubmit) 
      return;
    
    const deckInfo = {
      "documentId": selectedDocId,
      "difficulty": difficulty,
      "cardCount": cardCount,
    }

    try {
      const response = await fetch(`${API_BASE}/deck`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deckInfo),
      });

      const data = await response.json();

      if (response.ok) {
        const deck: IDeckCard = convertToIDeckCard(data.deck);
        onClose()
        onSubmit(deck);
      } else {
        showStatus({text: "Failed to create the deck!", type: "error"});
        console.error("Error: Failed to create the deck!");
      }
    } catch (err) {
      showStatus({text: "Could not connect to the backend!", type: "error"});
      console.error("Error: Could not connect to backend!", err);
    }
  };

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-deck-title"
            className="relative flex h-[600px] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white/10 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <h2 id="create-deck-title" className="text-lg font-semibold text-zinc-200">
                Create Deck
              </h2>

              <button
                onClick={onClose}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-lg text-neutral-400 outline outline-1 outline-offset-[-1px] outline-white/10 transition-colors hover:bg-white/10 hover:text-neutral-200"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Source document
                </span>

                <div className="max-h-48 overflow-y-auto rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10">
                  {documents.length === 0 ? (
                    <div className="flex items-center justify-center px-4 py-8 text-sm text-neutral-400">
                      No documents available yet.
                    </div>
                  ) : (
                    documents.map((doc, idx) => {
                      const isSelected = selectedDocId === doc.id;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDocId(doc.id)}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                            idx !== 0 ? "border-t border-white/5" : ""
                          } ${isSelected ? "bg-cyan-300/10" : "hover:bg-white/5"}`}
                        >
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg outline outline-1 outline-offset-[-1px] ${
                              isSelected
                                ? "bg-cyan-300/10 text-cyan-300 outline-cyan-300/30"
                                : "bg-white/10 text-neutral-300 outline-white/20"
                            }`}
                          >
                            <FileTextIcon className="size-4" />
                          </div>

                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium text-zinc-200">{doc.title}</span>
                            <span className="truncate text-xs text-neutral-400">{doc.category}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Difficulty
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTY_OPTIONS.map((option) => {
                    const isSelected = difficulty === option.key;
                    return (
                      <button
                        key={option.key}
                        onClick={() => setDifficulty(option.key)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg px-3 py-3 outline outline-1 outline-offset-[-1px] transition-colors ${
                          isSelected ? option.activeStyle : "text-neutral-300 outline-white/10 hover:bg-white/5"
                        }`}
                      >
                        <option.icon className="size-4" />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Number of cards
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {CARD_COUNT_OPTIONS.map((count) => {
                    const isSelected = cardCount === count;
                    return (
                      <button
                        key={count}
                        onClick={() => setCardCount(count)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg px-3 py-3 outline outline-1 outline-offset-[-1px] transition-colors ${
                          isSelected
                            ? "text-cyan-300 bg-cyan-300/10 outline-cyan-300/30"
                            : "text-neutral-300 outline-white/10 hover:bg-white/5"
                        }`}
                      >
                        <LayersIcon className="size-4" />
                        <span className="text-xs font-medium">{count} cards</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-3 py-2.5 text-xs leading-5 text-neutral-400">
                  <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-neutral-500" />
                  <span>
                    Card count isn't guaranteed - generation depends on how much content the source document
                    provides, so shorter documents may yield fewer cards than selected.
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 px-6 py-5">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Generate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}