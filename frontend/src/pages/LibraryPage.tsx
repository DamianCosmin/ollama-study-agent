import {
  Search,
  SlidersHorizontal,
  UploadCloud,
  FileText,
  FileWarning,
  Layers,
  MoreVertical,
  RotateCw,
} from "lucide-react";

type DocStatus = "vectorized" | "processing" | "error";

const DOCUMENTS: Array<{
  name: string;
  uploaded: string;
  status: DocStatus;
  statusLabel: string;
  chunks?: number;
  iconClasses: string;
  ring: string;
}> = [
  {
    name: "Introduction to Machine Learning.pdf",
    uploaded: "Uploaded Oct 24, 2023",
    status: "vectorized",
    statusLabel: "Vectorized",
    chunks: 124,
    iconClasses: "text-emerald-400 bg-emerald-400/10 outline-emerald-400/20",
    ring: "bg-emerald-400/10 outline-emerald-400/30 shadow-[0px_0px_10px_0px_rgba(78,222,163,0.10)]",
  },
  {
    name: "Cognitive Psychology Chapter 4.docx",
    uploaded: "Uploaded 2 hours ago",
    status: "processing",
    statusLabel: "Extracting Concepts",
    iconClasses: "text-cyan-400 bg-cyan-400/10 outline-cyan-400/20",
    ring: "bg-cyan-400/10 outline-cyan-400/30 shadow-[0px_0px_10px_0px_rgba(0,245,255,0.10)]",
  },
  {
    name: "History of Ancient Rome - Lecture Notes",
    uploaded: "Uploaded Oct 12, 2023",
    status: "vectorized",
    statusLabel: "Vectorized",
    chunks: 87,
    iconClasses: "text-emerald-400 bg-emerald-400/10 outline-emerald-400/20",
    ring: "bg-emerald-400/10 outline-emerald-400/30 shadow-[0px_0px_10px_0px_rgba(78,222,163,0.10)]",
  },
  {
    name: "Corrupted_Data_Set.csv",
    uploaded: "Uploaded Yesterday",
    status: "error",
    statusLabel: "Failed to parse",
    iconClasses: "text-red-300 bg-red-300/10 outline-red-300/20",
    ring: "bg-red-300/10 outline-red-300/30",
  },
];

export default function LibraryPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold leading-10 text-zinc-200">Knowledge Library</h1>
          <p className="text-base leading-6 text-neutral-300">
            Manage your uploaded courses, research papers, and study materials.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-300" />
            <input
              type="search"
              placeholder="Search documents..."
              className="w-full rounded-xl bg-white/5 py-3 pl-12 pr-4 text-sm text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[6px] placeholder:text-neutral-300/50 focus:outline-cyan-400/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10"
              aria-label="Filter documents"
            >
              <SlidersHorizontal className="size-4" />
            </button>
            <button
              type="button"
              className="flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-linear-to-r from-cyan-400/20 to-emerald-300/20 px-6 text-xs font-semibold tracking-wide text-cyan-400 outline outline-1 outline-offset-[-1px] outline-cyan-400/40 backdrop-blur-[6px] sm:flex-none"
            >
              <UploadCloud className="size-4" />
              Upload
            </button>
          </div>
        </div>
      </header>

      {/* Documents */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DOCUMENTS.map((doc) => {
          const Icon = doc.status === "error" ? FileWarning : FileText;
          return (
            <div
              key={doc.name}
              className="flex min-h-48 flex-col justify-between rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]"
            >
              <div className="flex items-start justify-between pb-6">
                <div className={`flex size-12 items-center justify-center rounded-lg outline outline-1 outline-offset-[-1px] ${doc.iconClasses}`}>
                  <Icon className="size-5" />
                </div>
                <button type="button" className="rounded-md p-1 text-neutral-300" aria-label="Document options">
                  <MoreVertical className="size-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1 pb-6">
                <h3 className="text-base font-semibold leading-6 text-zinc-200">{doc.name}</h3>
                <p className="text-sm leading-5 text-neutral-300">{doc.uploaded}</p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                {doc.status === "error" ? (
                  <>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-red-300 outline outline-1 outline-offset-[-1px] outline-red-300/30">
                      {doc.statusLabel}
                    </span>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-sm text-neutral-300 hover:text-zinc-200"
                    >
                      <RotateCw className="size-3.5" />
                      Retry
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide outline outline-1 outline-offset-[-1px] ${doc.ring} ${
                        doc.status === "vectorized" ? "text-emerald-400" : "text-cyan-400"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          doc.status === "vectorized" ? "bg-emerald-400" : "animate-pulse bg-cyan-400"
                        }`}
                      />
                      {doc.statusLabel}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-neutral-800/50 px-3 py-1 text-xs font-semibold tracking-wide text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/5">
                      <Layers className="size-3" />
                      {doc.chunks ?? "--"}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}