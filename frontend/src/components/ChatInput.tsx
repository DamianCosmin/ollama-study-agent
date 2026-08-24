import { ArrowUpIcon } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.Ref<HTMLTextAreaElement>;
  disabled: boolean;
}

export default function ChatInput({value, onChange, onSubmit, onKeyDown, textareaRef, disabled}: ChatInputProps) {
  return (
    <div className="flex items-end gap-2 rounded-2xl bg-white/5 p-2 pl-4 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] transition focus-within:outline-cyan-400/40">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Ask your tutor anything..."
        className="max-h-[280px] flex-1 resize-none overflow-y-auto bg-transparent py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-neutral-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowUpIcon className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}