import { useEffect } from "react";
import { XIcon } from "lucide-react";
import { IPopupStatus } from "../utils/types.ts";

interface StatusPopupProps {
  status: IPopupStatus | null;
  onClearStatus: () => void; 
}

export default function StatusPopup({ status, onClearStatus }: StatusPopupProps) {
  useEffect(() => {
    if (status) {
      const timer = setTimeout(onClearStatus, 3500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!status) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-full bg-white/25 px-5 py-2.5 backdrop-blur-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 shadow-[0px_8px_24px_0px_rgba(0,220,229,0.10)] animate-in fade-in slide-in-from-bottom-5">
      <div 
        className={`h-2.5 w-2.5 rounded-full ${status.type === "error"
          ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]" 
          : "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
        }`} 
      />

      <p className="text-sm font-bold tracking-wide text-zinc-200">
        {status.text}
      </p>

      <button 
        onClick={onClearStatus} 
        className="ml-1 rounded-full p-1.5 text-neutral-300 transition-colors hover:bg-white/10 hover:text-neutral-100"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}