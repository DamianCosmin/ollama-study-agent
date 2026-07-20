import { Search, SlidersHorizontal, UploadCloud } from "lucide-react";
import LibraryCard, { ILibraryCard } from "../components/LibraryCard.tsx";
import { PageHeader } from "../components/PageHeader.tsx";

const DOCUMENTS: Array<ILibraryCard> = [
  {
    id: "4fdf2489-39a5-4b4d-a58f-3fe60f9f1c8c",
    title: "Introduction to Machine Learning.pdf",
    uploadDate: new Date("2023-10-24T00:00:00"),
    status: "success",
    nrPages: 124,
  },
  {
    id: "f5cb6f3d-dfbd-4729-b79a-23f36341a8c0",
    title: "Cognitive Psychology Chapter 4.docx",
    uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "processing",
    nrPages: 0,
  },
  {
    id: "d7dbe4d7-227f-4dc0-9ae4-02dfbe211d99",
    title: "History of Ancient Rome - Lecture Notes",
    uploadDate: new Date("2023-10-12T00:00:00"),
    status: "success",
    nrPages: 87,
  },
  {
    id: "36fdf9be-c56c-4864-bb81-0f8e6b1acdee",
    title: "Corrupted_Data_Set.csv",
    uploadDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "error",
    nrPages: 0,
  },
];

export default function LibraryPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Knowledge Library"
        subtitle="Manage your uploaded courses, research papers, and study materials."
        actions={
          <>
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-300" strokeWidth={2.5} />
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
                className="group relative flex h-12 shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl bg-linear-76 from-cyan-400 to-emerald-300 px-6 text-sm font-bold tracking-wide text-neutral-900 shadow-[0px_0px_20px_0px_rgba(0,245,255,0.45)] outline outline-1 outline-offset-[-1px] outline-white/30 transition-transform hover:scale-[1.02]"
              >
                <UploadCloud className="size-4" strokeWidth={2.5} />
                  Upload
                <span className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/40 to-white/0" />
              </button>
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DOCUMENTS.map((doc, index) => (
          <LibraryCard 
            id={doc.id}
            key={index}
            title={doc.title}
            uploadDate={doc.uploadDate}
            status={doc.status}
            nrPages={doc.nrPages}
          />
        ))}
      </div>
    </div>
  );
}