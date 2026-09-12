import { BotIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { IChatMessage } from "../utils/types.ts";

const MARKDOWN_COMPONENTS = {
  p: ({children}: any) => (
    <p className="mb-0 last:mb-0">{children}</p>
  ),
  strong: ({children}: any) => (
    <strong className="font-semibold text-cyan-200">{children}</strong>
  ),
  em: ({children}: any) => (
    <em className="italic text-zinc-300">{children}</em>
  ),
  code: ({className, children, ...props}: any) => {
    const isBlock = /language-(\w+)/.test(className || "");

    return isBlock ? (
      <code className={`font-mono text-xs text-emerald-200 ${className || ""}`} {...props}>
        {children}
      </code>
    ) : (
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-cyan-200" {...props}>
        {children}
      </code>
    );
  },
  pre: ({children}: any) => (
    <pre className="my-1 overflow-x-auto rounded-lg bg-black/20 p-3 outline outline-1 outline-offset-[-1px] outline-white/10">
      {children}
    </pre>
  ),
};

interface ChatBubbleProps {
  message: IChatMessage;
}

export default function ChatBubble({message}: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 outline outline-1 outline-offset-[-1px] outline-cyan-400/20">
          <BotIcon className="size-3.5 text-cyan-400" />
        </span>
      )}

      <div
        className={`break-words rounded-2xl px-4 py-2.5 text-sm leading-6 ${
          isUser
            ? "max-w-[85%] sm:max-w-[75%] rounded-br-sm bg-cyan-400/15 text-zinc-100 outline outline-1 outline-offset-[-1px] outline-cyan-400/20 whitespace-pre-wrap"
            : "max-w-[90%] sm:max-w-[80%] rounded-bl-sm bg-white/5 text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/10"
        }`}
      >
        {isUser ? message.content : <ReactMarkdown components={MARKDOWN_COMPONENTS}>{message.content}</ReactMarkdown>}
      </div>
    </div>
  );
}