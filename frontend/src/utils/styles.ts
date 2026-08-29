export const DIFFICULTY_STYLES: Record<string, {stripe: string; tag: string;}> = {
  easy: {
    tag: "text-emerald-300 bg-emerald-300/10 outline-emerald-300/20",
    stripe: "bg-emerald-400",
  },
  medium: {
    tag: "text-cyan-300 bg-cyan-300/10 outline-cyan-300/20",
    stripe: "bg-cyan-400",
  },
  hard: {
    tag: "text-red-300 bg-red-300/10 outline-red-300/20",
    stripe: "bg-red-400",
  },
};

export const DECK_STATUS_STYLES: Record<string, {background: string, modalBackground: string, glow: string}> = {
  success: {
    background: "bg-white/5 outline-white/10 hover:bg-white/[0.07] focus-visible:outline-cyan-300/50",
    modalBackground: "bg-white/5 outline-white/10",
    glow: "bg-cyan-400/5",
  },
  processing: {
    background: "bg-white/5 outline-white/10 hover:bg-white/[0.07] focus-visible:outline-cyan-300/50",
    modalBackground: "bg-white/5 outline-white/10",
    glow: "bg-cyan-400/5",
  },
  error: {
    background: "bg-red-500/5 outline-red-500/40 hover:bg-red-500/[0.07] focus-visible:outline-red-500/60",
    modalBackground: "bg-red-500/5 outline-red-500/40",
    glow: "bg-red-500/5",
  },
};

export const FAILED_DECK_TAG_STYLE: string = "text-zinc-300 bg-zinc-300/10 outline-zinc-300/20";
export const FAILED_DECK_ICON_STYLE: string = "text-zinc-400";

export const SESSION_GRADIENT: string = "bg-gradient-to-br from-cyan-800/30 to-emerald-600/15";