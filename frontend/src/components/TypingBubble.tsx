import { BotIcon } from "lucide-react";

export default function TypingBubble() {
  return (
    <div className="flex items-end gap-2 self-start">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 outline outline-1 outline-offset-[-1px] outline-cyan-400/20">
        <BotIcon className="size-3.5 text-cyan-400" />
      </span>

      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/5 px-4 py-3 outline outline-1 outline-offset-[-1px] outline-white/10">
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-400" />
      </div>
    </div>
  );
}