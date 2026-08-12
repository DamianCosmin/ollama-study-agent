import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LayersIcon, type LucideIcon } from "lucide-react";

import DeckCardModal from "./DeckCardModal.tsx";
import { CATEGORIES } from "../utils/subjects.ts";
import { DIFFICULTY_STYLES, DECK_STATUS_STYLES, FAILED_DECK_TAG_STYLE, FAILED_DECK_ICON_STYLE } from "../utils/styles.ts";
import { IDeckCard } from "../utils/types.ts";
import { formatLastAccessedDate } from "../utils/functions.ts";

interface DeckCardProps {
  deck: IDeckCard;
  onStart?: (id: string) => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function DeckCard({ deck, onStart, onRename, onDelete }: DeckCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categoryAssets: {icon: LucideIcon; name: string; color: string} = CATEGORIES[deck.category] ?? CATEGORIES.general;
  const DeckIcon: LucideIcon = categoryAssets.icon;
  const dueCards: number = deck.nrCards - deck.lastUnanswered + 1;
  const difficultyTagStyle: string = DIFFICULTY_STYLES[deck.difficulty.toLowerCase()].tag ?? DIFFICULTY_STYLES.medium.tag;

  const deckStatusStyle: {background: string, modalBackground:string, glow: string} = DECK_STATUS_STYLES[deck.status.toLowerCase()] ?? DECK_STATUS_STYLES.error;
  const validDeck: boolean = deck.status !== "error";

  const layoutId: string = `deck-card-${deck.id}`;

  const renameDeck = async (id: string, newTitle: string) => {
    try {
      await onRename(id, newTitle);
    } finally {
      setIsOpen(false);
    }
  }

  const deleteDeck = async () => {
    try {
      await onDelete(deck.id);
    } finally {
      setIsOpen(false);
    }
  }

  return (
    <>
      <motion.div
        layoutId={layoutId}
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={`relative flex cursor-pointer flex-col gap-1 overflow-hidden rounded-xl p-5 ${deckStatusStyle.background} outline outline-1 outline-offset-[-1px] backdrop-blur-[10px] transition-colors focus-visible:outline-2`}
      >
        <div className={`pointer-events-none absolute -top-10 right-0 size-32 rounded-full ${deckStatusStyle.glow} blur-[20px]`} />

        <div className="flex items-start justify-between">
          <div className="flex size-12 items-center justify-center rounded-lg bg-white/10 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px]">
            <DeckIcon className={`size-5 ${validDeck ? categoryAssets.color: FAILED_DECK_ICON_STYLE}`} />
          </div>

          <span className={`rounded-sm px-2 py-1 text-xs outline outline-1 outline-offset-[-1px] ${validDeck ? difficultyTagStyle : FAILED_DECK_TAG_STYLE}`}>
            {deck.difficulty.toUpperCase()}
          </span>
        </div>

        <div className="pt-3 text-2xl font-bold leading-8 text-zinc-200">{deck.title}</div>
        <div className="pb-3 text-sm leading-5 text-neutral-300">{categoryAssets.name}</div>

        {validDeck ? (
          <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-4">
            <span className="flex items-center gap-1.5 text-xs leading-4 text-neutral-300">
              <LayersIcon className="size-3" />

              <span>{deck.nrCards} Cards</span>
              <span>•</span>

              {dueCards > 0 ? (
                <span className="text-emerald-400">{dueCards} Due</span>
              ) : (
                <span className="text-neutral-400">Up to date</span>
              )}
            </span>

            <span className="text-xs leading-4 text-neutral-300/70">
              {`Last studied: ${formatLastAccessedDate(deck.lastAccessed)}`}
            </span>
        </div>
        ) : (
          <div className="flex items-center mt-auto border-t border-white/5 pt-4">
            <span className="flex items-center gap-1.5 text-xs leading-4 text-red-400">
              <span>Failed to generate deck</span>
            </span>
          </div>
        )}
      </motion.div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <DeckCardModal
                deck={deck}
                layoutId={layoutId}
                categoryAssets={categoryAssets}
                difficultyTagStyle={difficultyTagStyle}
                deckStatusStyle={deckStatusStyle}
                dueCards={dueCards}
                onClose={() => setIsOpen(false)}
                onStart={onStart}
                onRename={renameDeck}
                onDelete={deleteDeck}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}