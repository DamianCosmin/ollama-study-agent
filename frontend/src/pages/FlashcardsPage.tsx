import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, PlusIcon, SlidersHorizontalIcon } from "lucide-react";

import { PageHeader } from "../components/PageHeader.tsx";
import RecentAnswer from "../components/RecentAnswer.tsx";
import DeckCard from "../components/DeckCard.tsx";
import CreateDeckModal from "../components/CreateDeckModal.tsx";
import StatusPopup from "../components/StatusPopup.tsx";
import { API_BASE, WS_BASE, IRecentAnswer, IDeckCard, IPopupStatus } from "../utils/types.ts";
import { convertToIDeckCard } from "../utils/functions.ts";

const RECENTLY_ANSWERED: IRecentAnswer[] = [
  {
    id: 1,
    question: "What is backpropagation?",
    deckName: "Neural Networks",
    answerDate: new Date("2026-07-21T13:05:48"),
    difficulty: "easy",
  },
  {
    id: 2,
    question: "Integral of sec(x)",
    deckName: "Calculus II",
    answerDate: new Date("2026-07-21T12:58:48"),
    difficulty: "medium",
  },
  {
    id: 3,
    question: "Define working memory by creating a story about a long long question",
    deckName: "Cognitive Psych",
    answerDate: new Date("2026-07-21T12:10:48"),
    difficulty: "hard",
  },
];

const DAILY_TARGET = { completed: 25, target: 40 };

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<IDeckCard[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "due">("all");
  const [status, setStatus] = useState<IPopupStatus | null>(null);

  const visibleDecks: IDeckCard[] = filter === "due" ? decks.filter((d) => d.lastUnanswered <= d.nrCards) : decks;
  const targetPercent: number = Math.round(DAILY_TARGET.completed / DAILY_TARGET.target * 100);
  
  const socketRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  const fetchDecks = async () => {
    try {
      const response = await fetch(`${API_BASE}/decks`, {
        method: "GET"
      });

      const data = await response.json();

      if (response.ok) {
        const rawData = data.decks as Array<Omit<IDeckCard, "createdAt" | "lastAccessed"> & {createdAt: string, lastAccessed: string}>;

        // Converts string dates from database into Date objects to match IDeckCard definition
        const decks: IDeckCard[] = rawData
          .map((deck) => convertToIDeckCard(deck))
          .sort((deckA, deckB) => deckB.createdAt.getTime() - deckA.createdAt.getTime());
        
        setDecks(decks);
      } else {
        console.error("Error: Failed to retrieve decks!", data);
      }
    } catch (err) {
      console.error("Error: Could not connect to backend!", err);
    }
  }

  const handleSubmit = (deck: IDeckCard) => {
    setDecks((prev) => prev ? [deck, ...prev] : [deck]);
  }

  const handleDeckGeneration = (id: string, title: string, status: string, nrCardsStr: string) => {
    const nrCards: number = Number.parseInt(nrCardsStr);

    setDecks((prev) => 
      prev ? prev.map((deck) => deck.id === id ? {...deck, title, status, nrCards} : deck) : prev
    );
  }

  const handleStartSession = (deck: IDeckCard) => {
    const mode: string = deck.lastUnanswered <= deck.nrCards ? "study" : "review";
    navigate(`/flashcards/session?deckId=${deck.id}&mode=${mode}`);
  }

  const handleTitleRename = async (deckId: string, newTitle: string) => {
    try {
      const titleBody = {
        "newTitle": newTitle
      }

      const response = await fetch(`${API_BASE}/decks/${deckId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(titleBody),
      })

      const data = await response.json();

      if (response.ok) {
        const updatedTitle: string = data.title ?? newTitle;
        setDecks((prev) =>
          prev.map((deck) => (deck.id === deckId ? { ...deck, title: updatedTitle } : deck))
        );
        setStatus({ text: "Deck renamed successfully!", type: "success" });
      } else {
        console.error("Error: Failed to rename deck!", data);
        setStatus({ text: "Error: Failed to rename the deck!", type: "error" });
      }
    } catch (err) {
      console.error("Error: Could not connect to backend!", err);
      setStatus({ text: "Error: Could not connect to the backend!", type: "error" });
    }
  }

  const handleDeckDelete = async (deckId: string) => {
    try {
      const response = await fetch(`${API_BASE}/decks/${deckId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        const deletedID: string = data.deckId;
        setDecks((prev) => prev.filter((deck) => deck.id !== deletedID));
        setStatus({ text: "Deck was deleted successfully!", type: "success" });
      } else {
        console.error("Error: Failed to delete deck!", data);
        setStatus({ text: "Error: Failed to delete the deck!", type: "error" });
      }
    } catch (err) {
      console.error("Error: Could not connect to backend!", err);
      setStatus({ text: "Error: Could not connect to the backend!", type: "error" });
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  useEffect(() => {
    const socket = new WebSocket(`${WS_BASE}/decks`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleDeckGeneration(data.id, data.title, data.status, data.nrCards);
    }

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    }

    return () => {
      socket.close()
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Flashcards"
        subtitle="Level up your memory with study decks forged directly from your notes."
        actions={
          <>
            <div className="relative w-full sm:w-80">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-300" strokeWidth={2.5} />
              <input
                type="search"
                placeholder="Search documents..."
                className="w-full rounded-xl bg-white/5 py-3 pl-12 pr-4 text-sm text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[6px] placeholder:text-neutral-300/50 focus:outline-cyan-400/50 [color-scheme:dark]"
              />
            </div>

            <button
              type="button"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10"
              aria-label="Filter documents"
            >
              <SlidersHorizontalIcon className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative flex h-12 shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl bg-linear-76 from-cyan-400 to-emerald-300 px-6 text-sm font-bold tracking-wide text-neutral-900 shadow-[0px_0px_20px_0px_rgba(0,245,255,0.45)] outline outline-1 outline-offset-[-1px] outline-white/30 transition-transform hover:scale-[1.02]"
            >
              <PlusIcon className="size-4" strokeWidth={2.5} />
                Create Deck
              <span className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/40 to-white/0" />
            </button>

            <CreateDeckModal 
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={handleSubmit}
            />
          </>
        }
      />

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        {/* Decks */}
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold leading-8 text-cyan-400">Available Decks</h2>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-full px-3 py-1 text-sm outline outline-1 outline-offset-[-1px] backdrop-blur-[10px] ${
                  filter === "all"
                    ? "bg-white/10 text-cyan-300 outline-cyan-300/50 backdrop-blur-[20px]"
                    : "bg-white/5 text-neutral-300 outline-white/10"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setFilter("due")}
                className={`rounded-full px-3 py-1 text-sm outline outline-1 outline-offset-[-1px] backdrop-blur-[10px] ${
                  filter === "due"
                    ? "bg-white/10 text-cyan-300 outline-cyan-300/50 backdrop-blur-[20px]"
                    : "bg-white/5 text-neutral-300 outline-white/10"
                }`}
              >
                Due
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleDecks.map((deck) => (
              <DeckCard 
                key={deck.id}
                deck={deck}
                onStart={handleStartSession}
                onRename={handleTitleRename}
                onDelete={handleDeckDelete}
              />
            ))}
          </div>
        </div>

        {/* Recent answers & Today's target */}
        <div className="flex w-full flex-col gap-6 xl:w-80 xl:flex-none">
          <div className="flex flex-col gap-4 rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <span className="text-xs font-semibold tracking-wide text-neutral-300">Recently Answered</span>
            <div className="flex flex-col gap-3">
              {RECENTLY_ANSWERED.map((ans) => (
                <RecentAnswer key={ans.id} answer={ans} />
              ))}
            </div>
          </div>

          <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <div className="pointer-events-none absolute bottom-0 right-0 size-32 rounded-full bg-fuchsia-500/10 blur-[20px]" />
            <span className="text-xs font-semibold tracking-wide text-neutral-300">Today's Target</span>
            
            <div className="flex items-end gap-2 py-2">
              <span className="text-3xl font-extrabold leading-10 text-zinc-200">{DAILY_TARGET.completed}</span>
              <span className="pb-1 text-sm text-neutral-300">cards studied</span>
            </div>
            
            <div className="relative h-2 overflow-hidden rounded-full bg-neutral-700">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-cyan-400 to-emerald-300 shadow-[0px_0px_10px_0px_rgba(0,245,255,0.50)]"
                style={{ width: `${Math.min(targetPercent, 100)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs leading-4 text-neutral-300">
              <span>Progress</span>
              <span>{targetPercent}% Daily Goal</span>
            </div>
          </div>
        </div>
      </div>

      <StatusPopup
        status={status}
        onClearStatus={() => setStatus(null)}
      />
    </div>
  );
}