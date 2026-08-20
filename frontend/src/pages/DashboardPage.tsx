import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon, ClockIcon, UploadCloudIcon, SparklesIcon, ChevronRightIcon } from "lucide-react";

import { PageHeader } from "../components/PageHeader.tsx";
import { useStatus } from "../context/StatusContext.tsx";
import { CATEGORIES } from "../utils/subjects.ts";
import { DIFFICULTY_STYLES } from "../utils/styles.ts";
import { AVATAR_URLS } from "../utils/avatars.ts";
import { API_BASE, IDeckCard, IUser, IDailyTarget } from "../utils/types.ts";
import { convertToIDeckCard, convertToIUser } from "../utils/functions.ts";

function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12)
    return "Good Morning";
  if (hour < 18)
    return "Good Afternoon";
  
  return "Good Evening";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { showStatus } = useStatus();

  const [user, setUser] = useState<IUser | null>(null);
  const [lastDecks, setLastDecks] = useState<IDeckCard[]>([]);
  const [dailyTarget, setDailyTarget] = useState<IDailyTarget | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const avatarUrl = AVATAR_URLS[user?.avatarId ?? ""] ?? AVATAR_URLS["neo-matrix"];
  const targetPercent = dailyTarget && dailyTarget.target > 0
    ? Math.min(100, Math.round((dailyTarget?.answered / dailyTarget?.target) * 100))
    : 0;

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const [userResponse, decksResponse, dailyResponse] = await Promise.all([
          fetch(`${API_BASE}/user`, {method: "GET"}),
          fetch(`${API_BASE}/decks`, {method: "GET"}),
          fetch(`${API_BASE}/user/daily`, {method: "GET"}),
        ]);

        const userData = await userResponse.json();
        const decksData = await decksResponse.json();
        const dailyData = await dailyResponse.json();

        if (cancelled)
          return;

        if (userResponse.ok) {
          const rawData = userData.user as Omit<IUser, "createdAt" | "lastActive"> & {createdAt: string, lastActive: string};
                  
          const user: IUser = convertToIUser(rawData);
          setUser(user);
        }

        if (decksResponse.ok) {
          const rawData = decksData.decks as Array<Omit<IDeckCard, "createdAt" | "lastAccessed"> & {createdAt: string, lastAccessed: string}>;

          const decks: IDeckCard[] = rawData
            .map((deck) => convertToIDeckCard(deck))
            .filter((deck) => deck.lastUnanswered > 1)
            .sort((deckA, deckB) => deckB.lastAccessed.getTime() - deckA.lastAccessed.getTime())
            .slice(0, 3);

          setLastDecks(decks);
        }

        if (dailyResponse.ok) {
          const daily: IDailyTarget = dailyData;
          setDailyTarget(daily);
        }

        if (!userResponse.ok || !decksResponse.ok || !dailyResponse.ok) {
          showStatus({text: "Failed to load dashboard data!", type: "error"});
          console.error("Error: Failed to load dashboard data!");
        }
      } catch (err) {
        console.error("Error: Could not connect to backend!", err);
        showStatus({text: "Could not load your dashboard.", type: "error"});
      } finally {
        if (!cancelled)
          setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [showStatus]);

  const goToDeckSession = (deck: IDeckCard) => {
    const mode = deck.lastUnanswered > deck.nrCards ? "review" : "study";
    navigate(`/flashcards/session?deckId=${deck.id}&mode=${mode}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${getGreeting()}${user ? `, ${user.username}` : ""}`}
        subtitle="Ready to conquer your next session?"
        actions={
          <button
            type="button"
            onClick={() => navigate("/settings")}
            aria-label="Go to settings"
            className="relative size-14 shrink-0 overflow-hidden rounded-full bg-white/5 shadow-[0px_0px_15px_0px_rgba(0,220,229,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-400/40 transition-transform hover:scale-105 sm:size-16"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${user?.avatarId} avatar`}
                className="size-full object-cover" 
                loading="lazy"
              />
            ) : (
              <UserIcon className="size-10 text-neutral-400" />
            )}
          </button>
        }
      />

      {/* Last Decks */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold leading-8 text-zinc-200">Last Decks</h2>
          
          <button
            type="button"
            onClick={() => navigate("/flashcards")}
            className="group relative pb-1 text-xs font-semibold tracking-wide text-cyan-300 transition-colors hover:text-cyan-400"
          >
            View All
            <span className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-cyan-400 transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center rounded-xl bg-white/5 text-sm text-neutral-400 outline outline-1 outline-offset-[-1px] outline-white/10">
            Loading…
          </div>
        ) : lastDecks.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-6 text-center outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <span className="text-sm text-neutral-300">No decks studied yet.</span>
            
            <button
              type="button"
              onClick={() => navigate("/flashcards")}
              className="group flex items-center text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-400"
            >
              Browse your decks 
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lastDecks.map((deck) => {
              const categoryAssets = CATEGORIES[deck.category] ?? CATEGORIES.general;
              const difficultyStyle = DIFFICULTY_STYLES[deck.difficulty.toLowerCase()]?.tag ?? DIFFICULTY_STYLES.medium.tag;
              const dueCards = deck.nrCards - deck.lastUnanswered + 1;

              return (
                <button
                  key={deck.id}
                  onClick={() => goToDeckSession(deck)}
                  className="relative flex flex-col gap-1 overflow-hidden rounded-xl bg-white/5 p-5 text-left outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] transition-colors hover:bg-white/[0.07]"
                >
                  <div className={`absolute inset-y-0 left-0 w-1 opacity-70 ${categoryAssets.color.replace("text-", "bg-")}`} />

                  <div className="flex items-start justify-between pb-2">
                    <span className={`rounded-sm px-2 py-1 text-xs font-semibold tracking-wide outline outline-1 outline-offset-[-1px] ${difficultyStyle}`}>
                      {deck.difficulty.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-2xl font-bold leading-8 text-zinc-200 line-clamp-3">{deck.title}</div>
                  <div className="text-sm leading-5 text-neutral-300">{categoryAssets.name}</div>

                  <div className="mt-auto flex w-full items-center gap-2 pt-3">
                    <ClockIcon className="size-3.5 text-emerald-400" />
                    
                    <span className="text-sm leading-5 text-zinc-200">
                      {dueCards > 0 ? `${dueCards} Cards Due` : "Up to date"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Library Upload & AI Tutor & Daily Goal */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <button
          type="button"
          onClick={() => navigate("/library")}
          className="flex min-h-56 flex-1 flex-col items-center justify-center gap-4 rounded-xl bg-white/5 p-8 text-center outline outline-2 outline-offset-[-2px] outline-cyan-400/30 backdrop-blur-[10px] transition-colors hover:bg-white/[0.07] sm:min-h-48"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-cyan-400/10 shadow-[0px_0px_20px_0px_rgba(0,245,255,0.20)]">
            <UploadCloudIcon className="size-7 text-cyan-400" />
          </div>

          <h3 className="text-xl font-bold leading-8 text-zinc-200 sm:text-2xl">
            Add New Study Material
          </h3>

          <p className="max-w-md text-sm leading-6 text-neutral-300 sm:text-base">
            Upload PDFs, slides, or notes to your library and turn them into flashcards.
          </p>

          <span className="flex items-center gap-1 rounded-full bg-white/5 px-6 py-2 text-xs font-semibold tracking-wide text-cyan-400 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px]">
            Go to Library
            <ChevronRightIcon className="size-3.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/tutor")}
          className="flex min-h-56 flex-1 flex-col items-center justify-center gap-4 rounded-xl bg-white/5 p-8 text-center outline outline-2 outline-offset-[-2px] outline-emerald-400/30 backdrop-blur-[10px] transition-colors hover:bg-white/[0.07] sm:min-h-48"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-400/10 shadow-[0px_0px_20px_0px_rgba(52,211,153,0.20)]">
            <SparklesIcon className="size-7 text-emerald-400" />
          </div>

          <h3 className="text-xl font-bold leading-8 text-zinc-200 sm:text-2xl">
            Ask the AI Tutor
          </h3>

          <p className="max-w-md text-sm leading-6 text-neutral-300 sm:text-base">
            Stuck on a concept? Get explanations tailored to your study material.
          </p>

          <span className="flex items-center gap-1 rounded-full bg-white/5 px-6 py-2 text-xs font-semibold tracking-wide text-emerald-400 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px]">
            Open AI Tutor
            <ChevronRightIcon className="size-3.5" />
          </span>
        </button>

        <div className="flex w-full flex-col justify-center gap-2 rounded-xl bg-white/5 p-6 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] lg:w-64 lg:flex-none xl:w-72">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
            Daily Goal
          </span>

          <div className="flex items-end justify-between pt-2">
            <span className="text-2xl font-bold leading-8 text-zinc-200">
              {dailyTarget?.answered ?? 0} / {dailyTarget?.target ?? 0}
            </span>

            <span className="text-sm text-cyan-400">{targetPercent}%</span>
          </div>

          <div className="relative h-2 overflow-hidden rounded-full bg-neutral-700">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-cyan-400 to-emerald-400 shadow-[0px_0px_10px_0px_rgba(105,246,185,0.50)]"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
          
          <span className="pt-1 text-xs leading-4 text-neutral-300">cards studied today</span>
        </div>
      </section>
    </div>
  );
}