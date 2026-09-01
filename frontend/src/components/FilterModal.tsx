import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon, CheckIcon, SlidersHorizontalIcon, type LucideIcon } from "lucide-react";

import { IFilterSection, FilterValues } from "../utils/types.ts";

interface FilterModalProps {
  isOpen: boolean;
  title: string;
  sections: IFilterSection[];
  initialValues: FilterValues;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
}

export default function FilterModal({
  isOpen,
  title,
  sections,
  initialValues,
  onClose,
  onApply,
}: FilterModalProps) {
  const [draft, setDraft] = useState<FilterValues>(initialValues);

  useEffect(() => {
    if (isOpen)
      setDraft(initialValues);
  }, [isOpen]);

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

  // Both functions clear a filter if it is clicked again
  const toggleMulti = (sectionId: string, value: string) => {
    setDraft((prev) => {
      const current = (prev[sectionId] as string[] | undefined) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {...prev, [sectionId]: next};
    });
  };

  const setSingle = (sectionId: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === value ? null : value
    }));
  };

  const handleClearAllFilters = () => setDraft({});

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const filterCount: number = Object.values(draft).reduce((count, val) => {
    if (Array.isArray(val))
      return count + val.length;

    if (val)
      return count + 1;

    return count;
  }, 0);

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
            aria-labelledby="filter-modal-title"
            className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white/5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] sm:max-w-2xl"
          >
            <div className="pointer-events-none absolute -top-10 right-0 size-40 rounded-full bg-cyan-400/5 blur-[20px]" />

            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontalIcon className="size-4 text-cyan-400" />

                <h2 id="filter-modal-title" className="text-lg font-semibold text-zinc-200">
                  {title}
                </h2>
              </div>

              <button
                onClick={onClose}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-lg text-neutral-400 outline outline-1 outline-offset-[-1px] outline-white/10 transition-colors hover:bg-white/10 hover:text-neutral-200"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
              {sections.map((section) => (
                <div key={section.id} className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    {section.title}
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {section.options.map((option) => {
                      const isSelected =
                        section.type === "multi"
                          ? ((draft[section.id] as string[] | undefined) ?? []).includes(option.value)
                          : draft[section.id] === option.value;

                      const OptionIcon: LucideIcon | undefined = option.icon;

                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            section.type === "multi"
                              ? toggleMulti(section.id, option.value)
                              : setSingle(section.id, option.value)
                          }
                          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm outline outline-1 outline-offset-[-1px] transition-colors ${
                            isSelected
                              ? "bg-cyan-300/10 text-cyan-300 outline-cyan-300/30"
                              : "text-neutral-300 outline-white/10 hover:bg-white/5"
                          }`}
                        >
                          {OptionIcon && <OptionIcon className="size-3.5 shrink-0" />}

                          <span className="truncate">
                            {option.label}
                          </span>

                          {isSelected && <CheckIcon className="ml-auto size-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 px-6 py-5">
              <button
                onClick={handleClearAllFilters}
                disabled={filterCount === 0}
                className="text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Clear all
              </button>

              <button
                onClick={handleApply}
                className="relative overflow-hidden rounded-lg bg-gradient-to-r from-cyan-400/80 to-emerald-300/80 px-6 py-2 text-xs font-semibold tracking-wide text-emerald-950 shadow-[0px_0px_15px_0px_rgba(0,220,229,0.30)] transition-opacity hover:opacity-90"
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-white/0" />
                Apply Filters {filterCount > 0 ? `(${filterCount})` : ""}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}