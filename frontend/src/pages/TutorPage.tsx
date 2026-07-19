import { Bot } from "lucide-react";

export default function TutorPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-white/5 p-12 text-center outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
      <span className="flex size-14 items-center justify-center rounded-full bg-cyan-400/10">
        <Bot className="size-6 text-cyan-400" />
      </span>
      <h1 className="text-2xl font-bold text-zinc-200">AI Tutor</h1>
      <p className="max-w-sm text-sm text-neutral-300">
        This page is wired into navigation, but under construction.
      </p>
    </div>
  );
}