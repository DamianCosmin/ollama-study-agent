import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon, MousePointerClickIcon, EyeIcon, ZapIcon, ThumbsUpIcon, ClockIcon, FrownIcon, ChevronRightIcon, ChevronLeftIcon, Loader2Icon, AlertCircleIcon, LayersIcon, type LucideIcon } from "lucide-react";

import { CATEGORIES } from "../utils/subjects.ts";
import { DIFFICULTY_STYLES } from "../utils/styles.ts";
import { API_BASE, FlashcardFeedback, IDeckCard, IFlashcard, SessionMode } from "../utils/types.ts";
import { convertToIDeckCard } from "../utils/functions.ts";

interface FeedbackOption {
  key: FlashcardFeedback;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  style: string;
}

const FEEDBACK_OPTIONS: FeedbackOption[] = [
  {
    key: "instant",
    label: "Instantly",
    sublabel: "< 5s",
    icon: ZapIcon,
    style: "text-emerald-300 bg-emerald-300/10 outline-emerald-300/30",
  },
  {
    key: "quick",
    label: "Quickly",
    sublabel: "5-15s",
    icon: ThumbsUpIcon,
    style: "text-cyan-300 bg-cyan-300/10 outline-cyan-300/30",
  },
  {
    key: "slow",
    label: "Slowly",
    sublabel: "15-40s",
    icon: ClockIcon,
    style: "text-amber-300 bg-amber-300/10 outline-amber-300/30",
  },
  {
    key: "struggled",
    label: "Struggled",
    sublabel: "> 40s",
    icon: FrownIcon,
    style: "text-red-300 bg-red-300/10 outline-red-300/30",
  },
];

export default function FlashcardsSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const deckId: string = searchParams.get("deckId") ?? "";
  const mode: SessionMode = searchParams.get("mode") === "review" ? "review" : "study";

  const [deck, setDeck] = useState<IDeckCard | null>(null);
  const [flashcards, setFlashcards] = useState<IFlashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentCard: IFlashcard | undefined = flashcards[currentIndex - 1];

  const total: number = flashcards.length;
  const progressLabel: string = `${currentIndex} / ${total}`;

  const Icon: LucideIcon = deck ? CATEGORIES[deck.category].icon : CATEGORIES.general.icon;
  const iconColor: string = deck ? CATEGORIES[deck.category].color : CATEGORIES.general.color;
  const difficultyTagStyle: string = currentCard ? DIFFICULTY_STYLES[currentCard.difficulty.toLowerCase()].tag : DIFFICULTY_STYLES.medium.tag;

  const goToIndex = useCallback(
    (nextIndex: number, dir: number) => {
      if (nextIndex < 1 || nextIndex > total) {
        return;
      }

      setDirection(dir);
      setIsFlipped(false);
      setCurrentIndex(nextIndex);
    },
    [total]
  );

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleFeedback = useCallback(
    (feedback: FlashcardFeedback) => {
      if (mode !== "study" || !currentCard || currentCard.feedback) {
        return;
      }

      //  TO-DO: register feedback on backend
      setFlashcards((prev) =>
        prev.map((card) => (card.id === currentCard.id ? { ...card, feedback: feedback } : card))
      );
    },
    [mode, currentCard]
  );

  const handleContinue = useCallback(() => {
    if (currentIndex + 1 > total) {
      navigate("/flashcards");
      return;
    }

    goToIndex(currentIndex + 1, 1);
  }, [currentIndex, total, goToIndex, navigate]);

  const handleExit = useCallback(() => {
    navigate("/flashcards");
  }, [navigate]);

  // Keyboard shortcuts: Space / Enter to flip, 1-4 for feedback, Arrows to navigate in review mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleExit();
        return;
      }

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
        return;
      }

      if (mode === "study" && isFlipped && !currentCard?.feedback && ["1", "2", "3", "4"].includes(e.key)) {
        const option = FEEDBACK_OPTIONS[Number(e.key) - 1];
        if (option)
            handleFeedback(option.key);

        return;
      }

      if (mode === "review") {
        if (e.key === "ArrowRight") 
            goToIndex(currentIndex + 1, 1);
        if (e.key === "ArrowLeft") 
            goToIndex(currentIndex - 1, -1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, isFlipped, currentCard, currentIndex, goToIndex, handleFlip, handleFeedback, handleExit]);

  useEffect(() => {
    if (!deckId) {
      navigate("/flashcards", {replace: true});
      return;
    }

    let cancelled = false;

    const fetchSession = async () => {
      setIsLoading(true);
      setLoadError(false);

      try {
        const [deckResponse, cardsResponse] = await Promise.all([
          fetch(`${API_BASE}/decks/${deckId}`, {method: "GET"}),
          fetch(`${API_BASE}/flashcards/${deckId}`, {method: "GET"}),
        ]);

        if (!deckResponse.ok || !cardsResponse.ok) {
          throw new Error("Failed to load session");
        }

        const deckData = await deckResponse.json();
        const cardsData = await cardsResponse.json();

        if (cancelled) 
          return;

        const deck: IDeckCard = convertToIDeckCard(deckData.deck);
        const flashcards: IFlashcard[] = cardsData.flashcards;

        // Client-side UX guards against fake review / study mode from URL
        if (mode === "review" && deck.lastUnanswered <= deck.nrCards) {
          navigate(`/flashcards/session?deckId=${deckId}&mode=study`, {replace: true});
          return;
        }

        if (mode === "study" && deck.lastUnanswered > deck.nrCards) {
          navigate(`/flashcards/session?deckId=${deckId}&mode=review`, {replace: true});
          return;
        }

        setDeck(deck);
        setFlashcards(flashcards);
        setCurrentIndex(mode === "study" ? Math.min(deck.lastUnanswered, flashcards.length || 1) : 1);
      } catch (err) {
        console.error("Failed to load session:", err);
        if (!cancelled)
          setLoadError(true);
      } finally {
        if (!cancelled)
          setIsLoading(false);
      }
    }

    fetchSession();
    return () => {
      cancelled = true;
    };
  }, [deckId, mode, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-cyan-950/50 to-emerald-950/50 px-4">
        <Loader2Icon className="size-8 animate-spin text-emerald-400/80" />
        <span className="text-xl font-semibold text-zinc-300">Loading...</span>
      </div>
    );
  }

  if (loadError || !deck) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-cyan-950/50 to-emerald-950/50 px-4">
        <AlertCircleIcon className="size-8 text-red-400/80" />
        <span className="text-xl font-semibold text-zinc-300">Could not load this deck!</span>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-cyan-950/50 to-emerald-950/50 px-4">
        <LayersIcon className="size-8 text-cyan-400/80" />
        <span className="text-xl font-semibold text-zinc-300">No cards to display!</span>
      </div>
    );
  }

  const swapVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.97 }),
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-neutral-900 px-4">
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-cyan-400/20 blur-[100px] sm:size-[500px] lg:size-[800px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-emerald-400/20 blur-[100px] sm:size-[400px] lg:size-[600px]" />

      {mode === "review" && (
        <>
          <button
            onClick={() => goToIndex(currentIndex - 1, -1)}
            disabled={currentIndex === 1}
            aria-label="Previous card"
            className="fixed left-4 top-1/2 z-40 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/5 text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] transition-colors hover:bg-white/10 disabled:opacity-30 sm:flex"
          >
            <ChevronLeftIcon className="size-5" />
          </button>

          <button
            onClick={() => goToIndex(currentIndex + 1, 1)}
            disabled={currentIndex === total}
            aria-label="Next card"
            className="fixed right-4 top-1/2 z-40 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/5 text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] transition-colors hover:bg-white/10 disabled:opacity-30 sm:flex"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </>
      )}

      <div className="relative flex w-full max-w-2xl flex-col items-center gap-4">
        <div style={{ perspective: 1800 }} className="w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentCard.id}
              custom={direction}
              variants={swapVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full"
            >
              <motion.div
                className="relative min-h-[420px] w-full sm:min-h-[480px]"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Front face */}
                <div
                  onClick={handleFlip}
                  role="button"
                  tabIndex={0}
                  style={{ backfaceVisibility: "hidden" }}
                  className="absolute inset-0 flex flex-col rounded-2xl bg-white/5 p-6 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] sm:p-8"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-white/10 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px]">
                      <Icon className={`size-5 ${iconColor}`} />
                    </div>
                    <span className={`rounded-sm px-2 py-1 text-xs outline outline-1 outline-offset-[-1px] ${difficultyTagStyle}`}>
                      {currentCard.difficulty.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-1 items-center justify-center px-2 py-8 text-center text-2xl font-bold leading-tight text-zinc-200 sm:text-3xl lg:text-4xl">
                    {currentCard.question}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
                    <MousePointerClickIcon className="size-3.5" />
                    Tap or click to flip
                  </div>
                </div>

                {/* Back face */}
                <div
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  className="absolute inset-0 flex flex-col rounded-2xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] sm:p-7"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-white/10 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px]">
                      <Icon className={`size-5 ${iconColor}`} />
                    </div>
                    <span className={`rounded-sm px-2 py-1 text-xs outline outline-1 outline-offset-[-1px] ${difficultyTagStyle}`}>
                      {currentCard.difficulty.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col items-center justify-center gap-2 overflow-hidden px-2 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-cyan-300">
                      <EyeIcon className="size-3.5" />
                      ANSWER
                    </span>
                    <p className="max-w-prose text-center text-base font-medium leading-snug text-zinc-200 sm:text-lg">
                      {currentCard.answer}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    {mode === "study" && !currentCard.feedback && (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs text-neutral-300 sm:text-sm">How well did you know this?</span>

                        <div className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-4">
                          {FEEDBACK_OPTIONS.map((option, idx) => (
                            <button
                              key={option.key}
                              onClick={() => handleFeedback(option.key)}
                              className={`flex w-full min-w-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 outline outline-1 outline-offset-[-1px] transition-colors hover:bg-white/5 ${option.style}`}
                            >
                              <option.icon className="size-3.5 shrink-0" />
                              <span className="w-full truncate text-center text-xs font-medium">{option.label}</span>
                              <span className="w-full truncate text-center text-[10px] text-neutral-400">{option.sublabel}</span>
                              <span className="hidden w-full truncate text-center text-[10px] text-neutral-500 sm:block">
                                Press {idx + 1}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {mode === "study" && currentCard.feedback && (
                      <div className="flex justify-center">
                        <button
                          onClick={handleContinue}
                          className="flex items-center gap-2 rounded-lg bg-cyan-300/10 px-5 py-2 text-sm font-medium text-cyan-300 outline outline-1 outline-offset-[-1px] outline-cyan-300/30 transition-colors hover:bg-cyan-300/20"
                        >
                          {currentIndex + 1 > total ? "Finish session" : "Continue"}
                          <ChevronRightIcon className="size-4" />
                        </button>
                      </div>
                    )}

                    {mode === "review" && (
                      <div className="flex justify-center gap-3 sm:hidden">
                        <button
                          onClick={() => goToIndex(currentIndex - 1, -1)}
                          disabled={currentIndex === 1}
                          className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 disabled:opacity-30"
                        >
                          <ChevronLeftIcon className="size-4" />
                          Prev
                        </button>

                        <button
                          onClick={() => goToIndex(currentIndex + 1, 1)}
                          disabled={currentIndex === total}
                          className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 disabled:opacity-30"
                        >
                          Next
                          <ChevronRightIcon className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {total <= 8 && (
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            {flashcards.map((card, idx) => (
              <span
                key={card.id}
                className={`size-1.5 rounded-full ${idx === currentIndex - 1 ? "bg-cyan-400" : "bg-white/20"}`}
              />
            ))}
            <span className="ml-1 text-xs text-neutral-300">{progressLabel}</span>
          </div>
        )}

        {total > 8 && (
          <div className="rounded-full bg-white/5 px-4 py-2 text-xs text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            {progressLabel}
          </div>
        )}
      </div>

      <button
        onClick={handleExit}
        aria-label="Exit session"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] transition-colors hover:bg-white/10 hover:text-neutral-100"
      >
        <XIcon className="size-4" />
        Exit
      </button>
    </div>
  );
}