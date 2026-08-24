import { BotIcon } from "lucide-react";
import { IChatMessage } from "../utils/types.ts";

interface ChatBubbleProps {
  message: IChatMessage;
}

export default function ChatBubble({message}: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse self-end" : "self-start"}`}>
      {!isUser && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 outline outline-1 outline-offset-[-1px] outline-cyan-400/20">
          <BotIcon className="size-3.5 text-cyan-400" />
        </span>
      )}

      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-6 sm:max-w-[75%] ${
          isUser
            ? "rounded-br-sm bg-cyan-400/15 text-zinc-100 outline outline-1 outline-offset-[-1px] outline-cyan-400/20"
            : "rounded-bl-sm bg-white/5 text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/10"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}