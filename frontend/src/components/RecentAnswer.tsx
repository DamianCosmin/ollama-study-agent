export interface IRecentAnswer {
  id: number;
  question: string;
  deckName: string;
  answerDate: Date;
  difficulty: string;
};

export interface RecentAnswerProps {
  answer: IRecentAnswer;
}

const DIFFICULTY_STYLES: Record<string, {stripe: string; tag: string;}> = {
  easy: {
    stripe: "bg-emerald-400",
    tag: "text-emerald-300 bg-emerald-300/10 outline-emerald-300/20",
  },
  medium: {
    stripe: "bg-cyan-400",
    tag: "text-cyan-300 bg-cyan-300/10 outline-cyan-300/20",
  },
  hard: {
    stripe: "bg-red-400",
    tag: "text-red-300 bg-red-300/10 outline-red-300/20",
  },
};

function formatAnswerDate(date: Date): string {
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

export default function RecentAnswer({answer}: RecentAnswerProps) {
  const styles: {stripe: string; tag: string;} = DIFFICULTY_STYLES[answer.difficulty] ?? DIFFICULTY_STYLES.easy; 

  return (
    <div 
      key={answer.id} 
      className="relative flex flex-col gap-2 overflow-hidden rounded-lg bg-white/10 p-3 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px]"
    >
      <div className={`absolute inset-y-0 left-0 w-1 opacity-50 ${styles.stripe}`} />

      <div className="flex items-start justify-between gap-4">
        <span className="truncate text-sm leading-5 text-zinc-200">{answer.question}</span>

        <span className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] leading-4 outline outline-1 outline-offset-[-1px] ${styles.tag}`}>
          {answer.difficulty.toUpperCase()}
        </span>
      </div>

      <span className="text-xs leading-4 text-neutral-300">{`${answer.deckName} • ${formatAnswerDate(answer.answerDate)}`}</span>
    </div>
  );
}