import { useState } from "react";
import {
  Search,
  Plus,
  Brain,
  Sigma,
  BookOpen,
  Sparkles,
  Layers as LayersIcon,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader.tsx";

type Deck = {
  id: string;
  name: string;
  subject: string;
  cardCount: number;
  dueCount: number;
  lastStudied: string;
  icon: typeof Brain;
  accent: string;
};

const DECKS: Deck[] = [
  {
    id: "neural-networks",
    name: "Neural Networks",
    subject: "Deep Learning Foundations",
    cardCount: 240,
    dueCount: 42,
    lastStudied: "Last studied: Today",
    icon: Brain,
    accent: "text-cyan-400",
  },
  {
    id: "calculus-ii",
    name: "Calculus II",
    subject: "Integration Techniques",
    cardCount: 185,
    dueCount: 0,
    lastStudied: "Last studied: 2d ago",
    icon: Sigma,
    accent: "text-fuchsia-300",
  },
  {
    id: "cognitive-psych",
    name: "Cognitive Psychology",
    subject: "Memory & Learning",
    cardCount: 320,
    dueCount: 15,
    lastStudied: "Last studied: Yesterday",
    icon: BookOpen,
    accent: "text-zinc-200",
  },
];

const RECENTLY_ANSWERED = [
  {
    question: "What is backpropagation?",
    subject: "Neural Networks • 5m ago",
    rating: "EASY",
    ratingClasses: "text-emerald-300 bg-emerald-300/10 outline-emerald-300/20",
    stripeClass: "bg-emerald-400",
  },
  {
    question: "Integral of sec(x)",
    subject: "Calculus II • 12m ago",
    rating: "GOOD",
    ratingClasses: "text-cyan-400 bg-cyan-400/10 outline-cyan-400/20",
    stripeClass: "bg-cyan-400",
  },
  {
    question: "Define working memory…",
    subject: "Cognitive Psych • 1h ago",
    rating: "HARD",
    ratingClasses: "text-red-300 bg-red-300/10 outline-red-300/20",
    stripeClass: "bg-red-300",
  },
];

const TODAYS_FOCUS = { studied: 84, goalPct: 65 };

export default function FlashcardsPage() {
  const [filter, setFilter] = useState<"all" | "due">("all");
  const visibleDecks = filter === "due" ? DECKS.filter((d) => d.dueCount > 0) : DECKS;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Flashcards"
        subtitle="Master your Knowledge Library through spaced repetition."
        actions={
          <>
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-300" strokeWidth={2.5} />
              <input
                type="search"
                placeholder="Search documents..."
                className="w-full rounded-xl bg-white/5 py-3 pl-12 pr-4 text-sm text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[6px] placeholder:text-neutral-300/50 focus:outline-cyan-400/50"
              />
            </div>
            <button
              type="button"
              className="group relative flex h-12 shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl bg-linear-76 from-cyan-400 to-emerald-300 px-6 text-sm font-bold tracking-wide text-neutral-900 shadow-[0px_0px_20px_0px_rgba(0,245,255,0.45)] outline outline-1 outline-offset-[-1px] outline-white/30 transition-transform hover:scale-[1.02]"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              Create Deck
              <span className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/40 to-white/0" />
            </button>
          </>
        }
      />

      {/* Decks + right rail */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        {/* Available decks */}
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
            {visibleDecks.map((deck) => {
              const Icon = deck.icon;
              return (
                <div
                  key={deck.id}
                  className="relative flex flex-col gap-1 overflow-hidden rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]"
                >
                  <div className="pointer-events-none absolute -top-10 right-0 size-32 rounded-full bg-cyan-400/5 blur-[20px]" />
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-white/10 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px]">
                      <Icon className={`size-5 ${deck.accent}`} />
                    </div>
                    {deck.dueCount > 0 ? (
                      <span className="rounded-sm bg-emerald-400/20 px-2 py-1 text-xs text-emerald-300 outline outline-1 outline-offset-[-1px] outline-emerald-300/30">
                        {deck.dueCount} Due
                      </span>
                    ) : (
                      <span className="rounded-sm bg-neutral-700 px-2 py-1 text-xs text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10">
                        Up to date
                      </span>
                    )}
                  </div>
                  <div className="pt-3 text-2xl font-bold leading-8 text-zinc-200">{deck.name}</div>
                  <div className="pb-3 text-sm leading-5 text-neutral-300">{deck.subject}</div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="flex items-center gap-2 text-xs leading-4 text-neutral-300">
                      <LayersIcon className="size-3" />
                      {deck.cardCount} Cards
                    </span>
                    <span className="text-xs leading-4 text-neutral-300/70">{deck.lastStudied}</span>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl bg-white/5 px-5 py-14 text-center outline outline-2 outline-offset-[-2px] outline-white/20 backdrop-blur-[10px]"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-white/10 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px]">
                <Sparkles className="size-4 text-cyan-50" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wide text-zinc-200">Import or Create</span>
                <span className="text-sm text-neutral-300">Generate via AI Tutor</span>
              </span>
            </button>
          </div>
        </div>

        {/* Right rail */}
        <div className="flex w-full flex-col gap-6 xl:w-80 xl:flex-none">
          <div className="flex flex-col gap-4 rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <span className="text-xs font-semibold tracking-wide text-neutral-300">Recently Answered</span>
            <div className="flex flex-col gap-3">
              {RECENTLY_ANSWERED.map((item) => (
                <div
                  key={item.question}
                  className="relative flex flex-col gap-2 overflow-hidden rounded-lg bg-white/10 p-3 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px]"
                >
                  <div className={`absolute inset-y-0 left-0 w-1 opacity-50 ${item.stripeClass}`} />
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm leading-5 text-zinc-200">{item.question}</span>
                    <span
                      className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] leading-4 outline outline-1 outline-offset-[-1px] ${item.ratingClasses}`}
                    >
                      {item.rating}
                    </span>
                  </div>
                  <span className="text-xs leading-4 text-neutral-300">{item.subject}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <div className="pointer-events-none absolute bottom-0 right-0 size-32 rounded-full bg-fuchsia-500/10 blur-[20px]" />
            <span className="text-xs font-semibold tracking-wide text-neutral-300">Today&apos;s Focus</span>
            <div className="flex items-end gap-2 py-2">
              <span className="text-3xl font-extrabold leading-10 text-zinc-200">{TODAYS_FOCUS.studied}</span>
              <span className="pb-1 text-sm text-neutral-300">cards studied</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-neutral-700">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-cyan-400 to-emerald-300 shadow-[0px_0px_10px_0px_rgba(0,245,255,0.50)]"
                style={{ width: `${TODAYS_FOCUS.goalPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs leading-4 text-neutral-300">
              <span>Progress</span>
              <span>{TODAYS_FOCUS.goalPct}% Daily Goal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}