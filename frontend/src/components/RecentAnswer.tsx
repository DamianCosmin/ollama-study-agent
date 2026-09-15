import { useNavigate } from "react-router-dom";
import { IRecentAnswer } from "../utils/types.ts";
import { DIFFICULTY_STYLES } from "../utils/styles.ts";

export interface RecentAnswerProps {
  answer: IRecentAnswer;
}

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
  const navigate = useNavigate();
  const styles: {tag: string, stripe: string} = DIFFICULTY_STYLES[answer.difficulty] ?? DIFFICULTY_STYLES.easy;

  return (
    <button
      type="button"
      onClick={() => navigate(`/flashcards/session?deckId=${answer.deckId}`)}
      className="relative flex w-full flex-col gap-2 overflow-hidden rounded-lg bg-white/10 p-3 text-left outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[20px] transition-colors hover:bg-white/[0.14]"
    >
      <div className={`absolute inset-y-0 left-0 w-1 opacity-50 ${styles.stripe}`} />

      <div className="flex w-full items-start justify-between gap-4">
        <span className="flex-1 min-w-0 truncate text-sm leading-5 text-zinc-200">{answer.question}</span>

        <span className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] leading-4 outline outline-1 outline-offset-[-1px] ${styles.tag}`}>
          {answer.difficulty.toUpperCase()}
        </span>
      </div>

      <span className="text-xs leading-4 text-neutral-300">{`${answer.deckTitle} • ${formatAnswerDate(answer.answerDate)}`}</span>
    </button>
  );
}