import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";

import { SESSION_GRADIENT } from "../utils/styles.ts";

interface ErrorPageProps {
  code?: string;
  title?: string;
  message?: string;
}

export default function ErrorPage({
  code = "404",
  title = "Page not found",
  message = "The page you're looking for doesn't exist or may have been moved!"
}: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden ${SESSION_GRADIENT} px-4`}>
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-[120px]" />

      <div className="relative flex flex-col items-center justify-center gap-6 rounded-2xl bg-white/5 px-8 py-16 text-center shadow-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px] pb-12 pt-16 sm:pb-16 sm:pt-20">
        <div className="flex flex-col gap-2">
          <span className="text-6xl font-extrabold leading-none text-zinc-200 sm:text-7xl">{code}</span>
          <h1 className="text-xl font-semibold text-zinc-200 sm:text-2xl">{title}</h1>

          <p className="max-w-sm text-sm leading-6 text-neutral-400 sm:text-base">
            {message}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 pt-8 sm:w-auto sm:flex-row">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10 transition-colors hover:bg-white/10"
          >
            <ArrowLeftIcon className="size-4" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="relative overflow-hidden rounded-lg bg-gradient-to-r from-cyan-400/80 to-emerald-300/80 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-[0px_0px_15px_0px_rgba(0,220,229,0.30)] transition-opacity hover:opacity-90"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-white/0" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}