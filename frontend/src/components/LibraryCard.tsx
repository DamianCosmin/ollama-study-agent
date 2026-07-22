import { useState } from "react";
import { FileText, FileWarning, Trash2, Layers, type LucideIcon } from "lucide-react";

export type LibraryCardTag = "Vectorized" | "Extracting concepts" | "Failed to parse";

export interface ILibraryCard {
  id: string;
  title: string;
  uploadDate: Date;
  status: string;
  nrPages: number;
};

const statusToTag: Record<string, LibraryCardTag> = {
  "success": "Vectorized",
  "processing": "Extracting concepts",
  "error": "Failed to parse",
};

const statusStyles: Record<string, {icon: string; ring: string; dot: string}> = {
  "success": {
    icon: "text-emerald-300 bg-emerald-300/10 outline-emerald-300/20",
    ring: "bg-emerald-400/10 outline-emerald-400/30 text-emerald-400",
    dot: "bg-emerald-400",
  },
  "processing": {
    icon: "text-cyan-300 bg-cyan-300/10 outline-cyan-300/20",
    ring: "bg-cyan-400/10 outline-cyan-400/30 text-cyan-400",
    dot: "animate-pulse bg-cyan-400",
  },
  "error": {
    icon: "text-red-300 bg-red-300/10 outline-red-300/20",
    ring: "bg-red-400/10 outline-red-400/30 text-red-400",
    dot: "bg-red-400",
  },
};

function formatDate(date: Date): string {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);

  return `Uploaded ${formattedDate}`;
};

export interface LibraryCardProps {
  card: ILibraryCard;
}

export default function LibraryCard({card} : LibraryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const Icon: LucideIcon = card.status === "error" ? FileWarning : FileText;
  const Tag: LibraryCardTag = statusToTag[card.status] || "Failed to parse";
  const styles: {icon: string, ring: string, dot: string} = statusStyles[card.status] ?? statusStyles.error;

  const handleDelete = () => {
    // TO-DO: Integrate with backend APIs
    const confirmed = window.confirm(`Delete "${card.title}"? This can't be undone.`);
    if (!confirmed) 
      return;

    setIsDeleting(true);
  };

  return(
    <div className="flex min-h-48 flex-col justify-between rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
      <div className="flex items-start justify-between pb-6">
        <div className={`flex size-12 items-center justify-center rounded-lg outline outline-1 outline-offset-[-1px] ${styles.icon}`}>
          <Icon className="size-5" />
        </div>
          
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md p-1 text-neutral-300 transition-colors hover:bg-red-400/10 hover:text-red-300"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1 pb-6">
        <h3 className="text-base font-semibold leading-6 text-zinc-200">{card.title}</h3>
        <p className="text-sm leading-5 text-neutral-300">{formatDate(card.uploadDate)}</p>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        {status === "error" ? (
          <>
            <span className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-red-300 outline outline-1 outline-offset-[-1px] outline-red-300/30">
              {Tag}
            </span>
          </>
        ) : (
          <>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide outline outline-1 outline-offset-[-1px] ${styles.ring}`}
            >
              <span className={`size-1.5 rounded-full ${styles.dot}`} />
              {Tag}
            </span>

            <span className="flex items-center gap-1.5 rounded-full bg-neutral-800/50 px-3 py-1 text-xs font-semibold tracking-wide text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/5">
              <Layers className="size-3" />
              {card.nrPages ?? "--"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}