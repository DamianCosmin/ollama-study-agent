import { SearchIcon, BellIcon, UploadCloudIcon, ClockIcon, MoreVerticalIcon } from "lucide-react";

const NEXT_UP = [
  {
    difficulty: "Hard",
    difficultyClasses: "text-red-300 bg-red-300/20 outline-red-300/30",
    stripeClass: "bg-red-300",
    subject: "Cell Biology",
    topic: "Mitochondrial Function",
    cardsDue: 24,
  },
  {
    difficulty: "Normal",
    difficultyClasses: "text-cyan-300 bg-cyan-300/20 outline-cyan-300/30",
    stripeClass: "bg-cyan-300",
    subject: "Calculus II",
    topic: "Integration by Parts",
    cardsDue: 12,
  },
  {
    difficulty: "Easy",
    difficultyClasses: "text-emerald-400 bg-emerald-400/20 outline-emerald-400/30",
    stripeClass: "bg-emerald-400",
    subject: "World History",
    topic: "Industrial Revolution",
    cardsDue: 5,
  },
];

const DAILY_GOAL = { done: 45, target: 60 };

export default function DashboardPage() {
  const progressPct = Math.min(100, (DAILY_GOAL.done / DAILY_GOAL.target) * 100);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold leading-tight text-zinc-200 sm:text-5xl sm:leading-[56px]">
            Good Evening, Cosmin
          </h1>
          <p className="text-sm text-cyan-400/80 sm:text-base">
            Ready to conquer your next session?
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button type="button" className="rounded-full p-2 text-neutral-300 hover:text-cyan-400" aria-label="Search">
            <SearchIcon className="size-5" />
          </button>
          <button type="button" className="rounded-full p-2 text-neutral-300 hover:text-cyan-400" aria-label="Notifications">
            <BellIcon className="size-5" />
          </button>
          <div className="relative size-10 overflow-hidden rounded-full bg-zinc-800 outline outline-1 outline-offset-[-1px] outline-white/20">
            <img
              className="size-full object-cover opacity-80"
              src="https://placehold.co/38x38"
              alt="Profile avatar"
            />
            <div className="absolute inset-0 bg-cyan-400/20" />
          </div>
        </div>
      </header>

      {/* Next Up */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold leading-8 text-zinc-200">Next Up</h2>
          <button type="button" className="text-xs font-semibold tracking-wide text-cyan-300">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {NEXT_UP.map((item) => (
            <div
              key={item.subject}
              className="relative flex flex-col gap-1 overflow-hidden rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]"
            >
              <div className={`absolute inset-y-0 left-0 w-1 opacity-70 ${item.stripeClass}`} />
              <div className="flex items-start justify-between pb-2">
                <span
                  className={`rounded-sm px-2 py-1 text-xs font-semibold tracking-wide outline outline-1 outline-offset-[-1px] ${item.difficultyClasses}`}
                >
                  {item.difficulty}
                </span>
                <button type="button" className="text-neutral-300" aria-label="Card options">
                  <MoreVerticalIcon className="size-5" />
                </button>
              </div>
              <div className="text-2xl font-bold leading-8 text-zinc-200">{item.subject}</div>
              <div className="text-sm leading-5 text-neutral-300">{item.topic}</div>
              <div className="flex items-center gap-2 pt-3">
                <ClockIcon className="size-3.5 text-emerald-400" />
                <span className="text-sm leading-5 text-zinc-200">{item.cardsDue} Cards Due</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upload + Daily goal */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex min-h-56 flex-1 flex-col items-center justify-center gap-4 rounded-xl bg-white/5 p-8 text-center outline outline-2 outline-offset-[-2px] outline-cyan-400/30 backdrop-blur-[10px] sm:min-h-48">
          <div className="flex size-16 items-center justify-center rounded-full bg-cyan-400/10 shadow-[0px_0px_20px_0px_rgba(0,245,255,0.20)]">
            <UploadCloudIcon className="size-7 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold leading-8 text-zinc-200 sm:text-2xl">
            Drop Lecture Materials Here
          </h3>
          <p className="max-w-md text-sm leading-6 text-neutral-300 sm:text-base">
            Upload PDFs, slides, or notes. AI Tutor will analyze and generate flashcards instantly.
          </p>
          <button
            type="button"
            className="rounded-full bg-white/5 px-6 py-2 text-xs font-semibold tracking-wide text-cyan-400 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px]"
          >
            Browse Files
          </button>
        </div>

        <div className="flex w-full flex-col justify-center gap-2 rounded-xl bg-white/5 p-6 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] lg:w-64 lg:flex-none xl:w-72">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
            Daily Goal
          </span>
          <div className="flex items-end justify-between pt-2">
            <span className="text-2xl font-bold leading-8 text-zinc-200">
              {DAILY_GOAL.done} / {DAILY_GOAL.target}
            </span>
            <span className="text-sm text-cyan-400">mins</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-neutral-700">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-cyan-400 to-emerald-400 shadow-[0px_0px_10px_0px_rgba(105,246,185,0.50)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}