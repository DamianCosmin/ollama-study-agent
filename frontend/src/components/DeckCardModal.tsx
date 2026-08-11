import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayersIcon, PlayIcon, PencilIcon, Trash2Icon, XIcon, CheckIcon, type LucideIcon } from "lucide-react";

import { IDeckCard } from "../utils/types.ts";
import { formatLastAccessedDate } from "../utils/functions.ts";

const MAX_TITLE_CHARS = 100;

interface DeckCardModalProps {
  deck: IDeckCard;
  layoutId: string;
  categoryAssets: {icon: LucideIcon; name: string; color: string};
  difficultyTagStyle: string;
  dueCards: number;
  onClose: () => void;
  onStart?: (id: string) => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function DeckCardModal({
  deck,
  layoutId,
  categoryAssets,
  difficultyTagStyle,
  dueCards,
  onClose,
  onStart,
  onRename,
  onDelete,
}: DeckCardModalProps) {
  const DeckIcon = categoryAssets.icon;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [isRenaming, setIsRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(deck.title);
  const charCount = titleDraft.trim().length;
  const isTitleValid = charCount > 0 && charCount <= MAX_TITLE_CHARS;

  const startRenaming = () => {
    if (deck.status !== "success")
      return

    setTitleDraft(deck.title);
    setIsRenaming(true);
    setConfirmingDelete(false);
  };

  const cancelRenaming = () => {
    setTitleDraft(deck.title);
    setIsRenaming(false);
  };

  const submitRenaming = () => {
    if (!isTitleValid)
      return;

    onRename(deck.id, titleDraft.trim());
    setIsRenaming(false);
    onClose();
  };

  // Lock background scroll and allow Escape to close while the modal is open
  useEffect(() => {
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
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
      />

      <motion.div
        layoutId={layoutId}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-y-auto rounded-2xl bg-white/5 p-6 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] sm:p-8"
      >
        <div className="pointer-events-none absolute -top-10 right-0 size-40 rounded-full bg-cyan-400/5 blur-[20px]" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg text-neutral-400 outline outline-1 outline-offset-[-1px] outline-white/10 transition-colors hover:bg-white/10 hover:text-neutral-200 sm:size-8"
        >
          <XIcon className="size-4" />
        </button>

        <div className="flex items-start justify-between pr-10">
          <div className="flex size-14 items-center justify-center rounded-lg bg-white/10 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px] sm:size-16">
            <DeckIcon className={`size-6 ${categoryAssets.color} sm:size-7`} />
          </div>

          <span className={`rounded-sm px-2 py-1 text-xs outline outline-1 outline-offset-[-1px] ${difficultyTagStyle}`}>
            {deck.difficulty.toUpperCase()}
          </span>
        </div>

        <div className="pt-4 text-3xl font-bold leading-9 text-zinc-200 sm:text-4xl">
          {deck.title}
        </div>

        <div className="pb-4 text-sm leading-5 text-neutral-300 sm:text-base">
          {categoryAssets.name}
        </div>

        <div className="flex items-center gap-1.5 border-t border-white/5 pb-6 pt-5 text-xs leading-4 text-neutral-300 sm:text-sm">
          <LayersIcon className="size-3.5" />

          <span>{deck.nrCards} Cards</span>
          <span>•</span>

          {dueCards > 0 ? (
            <span className="text-emerald-400">{dueCards} Due</span>
          ) : (
            <span className="text-neutral-400">Up to date</span>
          )}

          <span>•</span>
          <span className="text-neutral-300/70">
            {`Last studied: ${formatLastAccessedDate(deck.lastAccessed)}`}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <ModalAction
            icon={PlayIcon}
            label="Start answering"
            iconColor="text-cyan-300"
            onClick={() => {
              onStart?.(deck.id);
              onClose();
            }}
          />

          {!isRenaming ? (
            <ModalAction
              icon={PencilIcon}
              label="Rename deck"
              iconColor="text-neutral-300"
              onClick={startRenaming}
              disabled={deck.status !== "success"}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2 rounded-lg px-3 py-3 outline outline-1 outline-offset-[-1px] outline-cyan-300/20 bg-cyan-300/5"
            >
              <div className="flex items-center gap-2">
                <PencilIcon className="size-4 shrink-0 text-neutral-300" />
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") 
                      submitRenaming();
                  }}
                  autoFocus
                  maxLength={MAX_TITLE_CHARS}
                  className="min-w-0 flex-1 rounded-md bg-white/5 px-2.5 py-1.5 text-sm text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/10 focus:outline-cyan-300/50 [color-scheme:dark]"
                  placeholder="Enter a new title..."
                />
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs ${isTitleValid ? "text-neutral-300" : "text-red-300"}`}>
                  {charCount}/{MAX_TITLE_CHARS} characters
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelRenaming}
                    className="rounded-md px-3 py-1.5 text-xs text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={submitRenaming}
                    disabled={!isTitleValid}
                    className="flex items-center gap-1 rounded-md bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-300 outline outline-1 outline-offset-[-1px] outline-cyan-300/30 transition-colors hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <CheckIcon className="size-3.5" />
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {!confirmingDelete ? (
            <ModalAction
              icon={Trash2Icon}
              label="Delete deck"
              iconColor="text-red-300"
              labelColor="text-red-300"
              onClick={() => {
                setConfirmingDelete(true);
                cancelRenaming();
              }}
            />
          ) : (
            <div className="flex items-center gap-2 rounded-lg px-3 py-3 outline outline-1 outline-offset-[-1px] outline-red-300/20 bg-red-300/5">
              <Trash2Icon className="size-5 shrink-0 text-red-300" />
              <span className="flex-1 text-red-300">Delete this deck?</span>

              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-md px-3 py-1.5 text-xs text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                onClick={() => onDelete()}
                className="rounded-md bg-red-300/10 px-3 py-1.5 text-xs text-red-300 outline outline-1 outline-offset-[-1px] outline-red-300/30 transition-colors hover:bg-red-300/20"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

interface ModalActionProps {
  icon: LucideIcon;
  label: string;
  iconColor: string;
  labelColor?: string;
  onClick: () => void;
  disabled?: boolean;
}

function ModalAction({ icon: Icon, label, iconColor, labelColor, onClick, disabled }: ModalActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/0 transition-colors hover:bg-white/5 hover:outline-white/10 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:outline-transparent sm:text-base"
    >
      <Icon className={`size-5 ${iconColor}`} />
      <span className={labelColor ?? "text-zinc-200"}>{label}</span>
    </button>
  );
}