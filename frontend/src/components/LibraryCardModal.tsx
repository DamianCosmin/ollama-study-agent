import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2Icon } from "lucide-react";

interface DeleteConfirmModalProps {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ title, onCancel, onConfirm }: DeleteConfirmModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        className="relative flex w-full max-w-sm flex-col gap-4 overflow-hidden rounded-xl bg-white/5 p-6 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]"
      >
        <div className="pointer-events-none absolute -top-10 right-0 size-32 rounded-full bg-red-400/5 blur-[20px]" />

        <div className="flex size-12 items-center justify-center rounded-lg bg-red-300/10 outline outline-1 outline-offset-[-1px] outline-red-300/20">
          <Trash2Icon className="size-5 text-red-300" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 id="delete-confirm-title" className="text-lg font-semibold leading-6 text-zinc-200">
            {`Delete "${title}"?`}
          </h2>

          <p className="text-sm leading-5 text-neutral-300">
            This action cannot be undone. All flashcards and decks related to this document will be permanently deleted!
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-300/10 px-4 py-2 text-sm text-red-300 outline outline-1 outline-offset-[-1px] outline-red-300/30 transition-colors hover:bg-red-300/20"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}