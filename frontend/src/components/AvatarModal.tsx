import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, SparklesIcon, type LucideIcon } from "lucide-react";

export interface AvatarOption {
  id: string;
  name: string;
  gradient: string;
  icon: LucideIcon;
}

const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "nexus-node", name: "Nexus Node", gradient: "from-cyan-400/40 via-cyan-300/10 to-transparent", icon: SparklesIcon },
  { id: "aether-core", name: "Aether Core", gradient: "from-cyan-300/50 via-emerald-300/20 to-transparent", icon: SparklesIcon },
  { id: "orbital-shift", name: "Orbital Shift", gradient: "from-emerald-400/40 via-emerald-500/10 to-transparent", icon: SparklesIcon },
  { id: "synth-mind", name: "Synth Mind", gradient: "from-blue-400/40 via-indigo-400/10 to-transparent", icon: SparklesIcon },
  { id: "flux-state", name: "Flux State", gradient: "from-fuchsia-400/40 via-purple-400/10 to-transparent", icon: SparklesIcon },
  { id: "quantum-lotus", name: "Quantum Lotus", gradient: "from-teal-300/40 via-cyan-400/10 to-transparent", icon: SparklesIcon },
];

interface AvatarModalProps {
  isOpen: boolean;
  currentAvatarId: string | null;
  onClose: () => void;
  onSave: (avatarId: string) => void;
}

export default function AvatarModal({isOpen, currentAvatarId, onClose, onSave}: AvatarModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(currentAvatarId);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(currentAvatarId);
    }
  }, [isOpen, currentAvatarId]);

  useEffect(() => {
    if (!isOpen)
      return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape")
        onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (!selectedId)
      return;

    onSave(selectedId);
    onClose();
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
            aria-labelledby="avatar-select-title"
            className="relative flex w-full max-w-2xl flex-col gap-6 rounded-2xl bg-white/5 p-6 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] sm:p-8"
          >
            <div className="pointer-events-none absolute -top-10 left-1/2 size-40 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[30px]" />

            <div className="relative flex flex-col items-center gap-1 text-center">
              <h2 id="avatar-select-title" className="text-2xl font-bold leading-8 text-cyan-400 sm:text-3xl">
                Choose Your Avatar
              </h2>

              <p className="text-sm leading-5 text-neutral-300">
                Find your vibe. Pick a new avatar from the collection.
              </p>
            </div>

            <div className="relative grid grid-cols-3 gap-4 sm:gap-6">
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = selectedId === avatar.id;
                const AvatarIcon = avatar.icon;

                return (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedId(avatar.id)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`flex size-16 items-center justify-center rounded-full bg-gradient-to-br outline outline-2 outline-offset-2 transition-all sm:size-20 ${avatar.gradient} ${
                        isSelected
                          ? "outline-cyan-400 shadow-[0px_0px_20px_0px_rgba(0,220,229,0.50)]"
                          : "outline-white/10 hover:outline-white/30"
                      }`}
                    >
                      <AvatarIcon className={`size-6 sm:size-7 ${isSelected ? "text-cyan-200" : "text-white/70"}`} />
                    </div>
                    
                    <span
                      className={`text-center text-[11px] font-semibold uppercase tracking-wide sm:text-xs ${
                        isSelected ? "text-cyan-300" : "text-neutral-400"
                      }`}
                    >
                      {avatar.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex items-center justify-end gap-3 border-t border-white/10 pt-5">
              <button
                onClick={onClose}
                className="rounded-lg px-5 py-2.5 text-sm text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={!selectedId}
                className="relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-400/80 to-emerald-300/80 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-[0px_0px_15px_0px_rgba(0,220,229,0.30)] transition-opacity hover:opacity-90 disabled:opacity-30"
              >
                <CheckIcon className="size-4" />
                Save Avatar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}