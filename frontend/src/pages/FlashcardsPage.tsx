import { useState } from "react";
import { SearchIcon, PlusIcon, SlidersHorizontalIcon } from "lucide-react";

import { PageHeader } from "../components/PageHeader.tsx";
import RecentAnswer from "../components/RecentAnswer.tsx";
import DeckCard from "../components/DeckCard.tsx";
import { IRecentAnswer, IDeckCard } from "../utils/types.ts";

const DECKS: IDeckCard[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "Neural Networks",
    difficulty: "hard",
    category: "computer",
    createdAt: new Date("2026-06-15T10:30:00"),
    lastAccessed: new Date("2026-07-22T08:15:00"),
    totalCards: 240,
    lastAnsweredIndex: 198,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Calculus II",
    difficulty: "medium",
    category: "mathematics",
    createdAt: new Date("2026-05-10T14:20:00"),
    lastAccessed: new Date("2026-07-20T16:45:00"),
    totalCards: 185,
    lastAnsweredIndex: 183,
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Cognitive Psychology",
    difficulty: "easy",
    category: "psychology",
    createdAt: new Date("2026-07-01T09:00:00"),
    lastAccessed: new Date("2026-07-21T19:30:00"),
    totalCards: 320,
    lastAnsweredIndex: 45,
  },
  {
    id: "8d969eef-6ec9-4c8d-8a2b-923f0532292f",
    title: "Molecular Biology",
    difficulty: "hard",
    category: "sciences",
    createdAt: new Date("2026-07-10T11:15:00"),
    lastAccessed: new Date("2026-07-18T14:20:00"),
    totalCards: 150,
    lastAnsweredIndex: 22,
  },
  {
    id: "a38c23f7-9b1e-4589-8d2a-4123b3a7c65d",
    title: "Microeconomics",
    difficulty: "medium",
    category: "economics",
    createdAt: new Date("2026-06-25T08:45:00"),
    lastAccessed: new Date("2026-07-15T09:10:00"),
    totalCards: 210,
    lastAnsweredIndex: 209,
  },
  {
    id: "e94b415a-7183-4a6c-95b6-7248103c812e",
    title: "Constitutional Law",
    difficulty: "hard",
    category: "law",
    createdAt: new Date("2026-05-20T13:00:00"),
    lastAccessed: new Date("2026-07-10T10:00:00"),
    totalCards: 400,
    lastAnsweredIndex: 310,
  },
  {
    id: "b2a19f43-8e7c-4a51-9d22-1f3c8a90b4e5",
    title: "Sustainable Crop Management",
    difficulty: "medium",
    category: "agriculture",
    createdAt: new Date("2026-06-20T10:00:00"),
    lastAccessed: new Date("2026-07-21T08:30:00"),
    totalCards: 120,
    lastAnsweredIndex: 45,
  }
];

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
  const [filter, setFilter] = useState<"all" | "due">("all");
  const visibleDecks: IDeckCard[] = filter === "due" ? DECKS.filter((d) => d.lastAnsweredIndex < d.totalCards - 1) : DECKS;
  const targetPercent: number = Math.round(DAILY_TARGET.completed / DAILY_TARGET.target * 100);

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
                className="w-full rounded-xl bg-white/5 py-3 pl-12 pr-4 text-sm text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[6px] placeholder:text-neutral-300/50 focus:outline-cyan-400/50"
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
              className="group relative flex h-12 shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl bg-linear-76 from-cyan-400 to-emerald-300 px-6 text-sm font-bold tracking-wide text-neutral-900 shadow-[0px_0px_20px_0px_rgba(0,245,255,0.45)] outline outline-1 outline-offset-[-1px] outline-white/30 transition-transform hover:scale-[1.02]"
            >
              <PlusIcon className="size-4" strokeWidth={2.5} />
              Create Deck
              <span className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/40 to-white/0" />
            </button>
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
                Due Today
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleDecks.map((deck) => (
              <DeckCard 
                deck={deck}
                onStart={() => {}}
                onRename={() => {}}
                onDelete={() => {}}
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
                <RecentAnswer answer={ans} />
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
    </div>
  );
}