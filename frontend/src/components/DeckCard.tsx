import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LayersIcon, type LucideIcon } from "lucide-react";

import DeckCardModal from "./DeckCardModal.tsx";
import { CATEGORIES } from "../utils/subjects.ts";
import { DIFFICULTY_STYLES } from "../utils/styles.ts";
import { IDeckCard } from "../utils/types.ts";
import { formatLastAccessedDate } from "../utils/functions.ts";

export interface DeckCardProps {
  deck: IDeckCard;
  onStart?: (id: string) => void;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function DeckCard({deck, onStart, onRename, onDelete}: DeckCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categoryAssets: {icon: LucideIcon; name: string; color: string} = CATEGORIES[deck.category] ?? CATEGORIES.general;
  const DeckIcon: LucideIcon = categoryAssets.icon;
  const dueCards: number = deck.totalCards - deck.lastAnsweredIndex - 1;
  const difficultyStyle: string = DIFFICULTY_STYLES[deck.difficulty.toLowerCase()] ?? DIFFICULTY_STYLES.medium;
  
  const layoutId = `deck-card-${deck.id}`;

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
        className="relative flex cursor-pointer flex-col gap-1 overflow-hidden rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] transition-colors hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-cyan-300/50"
      >
        <div className="pointer-events-none absolute -top-10 right-0 size-32 rounded-full bg-cyan-400/5 blur-[20px]" />

        <div className="flex items-start justify-between">
          <div className="flex size-12 items-center justify-center rounded-lg bg-white/10 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px]">
            <DeckIcon className={`size-5 ${categoryAssets.color}`} />
          </div>

          <span className={`rounded-sm px-2 py-1 text-xs outline outline-1 outline-offset-[-1px] ${difficultyStyle}`}>
            {deck.difficulty.toUpperCase()}
          </span>
        </div>

        <div className="pt-3 text-2xl font-bold leading-8 text-zinc-200">{deck.title}</div>
        <div className="pb-3 text-sm leading-5 text-neutral-300">{categoryAssets.name}</div>

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <span className="flex items-center gap-1.5 text-xs leading-4 text-neutral-300">
            <LayersIcon className="size-3" />

            <span>{deck.totalCards} Cards</span>
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
      </motion.div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <DeckCardModal
                deck={deck}
                layoutId={layoutId}
                categoryAssets={categoryAssets}
                difficultyStyle={difficultyStyle}
                dueCards={dueCards}
                onClose={() => setIsOpen(false)}
                onStart={onStart}
                onRename={onRename}
                onDelete={onDelete}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}