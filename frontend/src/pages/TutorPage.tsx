import { useRef, useState } from "react";
import { BotIcon, ArrowUpIcon } from "lucide-react";
import { PageHeader } from "../components/PageHeader.tsx";
import "../App.css";

const BUTTONS: string[] = ["Explain a concept", "Check my work", "Build a study plan"];

export default function TutorPage() {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="AI Tutor"
        subtitle="Ask questions, work through problems, and get explanations tailored to what you're studying."
      />

      <div className="relative flex flex-col items-center justify-center gap-8 overflow-hidden rounded-xl bg-white/5 px-6 py-16 text-center outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
        {/* Icon & Heading */}
        <div className="relative flex flex-col items-center gap-4">
          <span className="relative flex size-16 items-center justify-center rounded-full bg-cyan-400/10 outline outline-1 outline-cyan-400/20">
            <span
              className="absolute inset-0 rounded-full outline outline-1 outline-cyan-400/20 motion-safe:animate-slow-pulse-ring"
            />
            <BotIcon className="size-7 text-cyan-400" />
          </span>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-medium text-white">
              What are we studying today?
            </h2>

            <p className="max-w-sm text-sm text-neutral-400">
              Ask me to clarify anything from your study materials.
            </p>
          </div>
        </div>

        {/* Input box */}
        <div className="relative w-full max-w-2xl">
          <div className="flex items-end gap-2 rounded-2xl bg-white/5 p-2 pl-4 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] transition focus-within:outline-cyan-400/40">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleInput}
              rows={1}
              placeholder="Ask your tutor anything..."
              className="max-h-[280px] flex-1 resize-none overflow-y-auto bg-transparent py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />

            <button
              type="button"
              aria-label="Send message"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-neutral-950 transition hover:bg-cyan-300"
            >
              <ArrowUpIcon className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="relative flex flex-wrap items-center justify-center gap-5">
          {BUTTONS.map(
            (label) => (
              <button
                key={label}
                type="button"
                className="rounded-full bg-white/5 px-5 py-1.5 text-xs text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] transition hover:bg-white/10 hover:text-white"
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}