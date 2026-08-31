import { useEffect, useState, useRef } from "react";
import { SearchIcon, SlidersHorizontalIcon, SearchXIcon, FileXIcon } from "lucide-react";
import LibraryCard from "../components/LibraryCard.tsx";
import UploadButton from "../components/UploadButton.tsx";
import { PageHeader } from "../components/PageHeader.tsx";
import { useStatus } from "../context/StatusContext.tsx";
import { API_BASE, WS_BASE, ILibraryCard } from "../utils/types.ts";
import { convertToILibraryCard } from "../utils/functions.ts";

export default function LibraryPage() {
  const [documents, setDocuments] = useState<ILibraryCard[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const { showStatus } = useStatus();

  const searchedDocuments: ILibraryCard[] = documents
    ? documents.filter((doc) => doc.title.toLowerCase().includes(searchInput.toLowerCase().trim()))
    : [];

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE}/documents`, {
        method: "GET"
      });

      const data = await response.json();

      if (response.ok) {
        const rawData = data.documents as Array<Omit<ILibraryCard, "uploadDate"> & {uploadDate: string}>;
        
        // Converts string date from database into Date object to match ILibraryCard definition
        const docs: ILibraryCard[] = rawData
          .map((doc) => convertToILibraryCard(doc))
          .sort((docA, docB) => docB.uploadDate.getTime() - docA.uploadDate.getTime());

        setDocuments(docs);
      } else {
        showStatus({text: "Failed to retrieve documents!", type: "error"});
        console.error("Error: Failed to retrieve documents!", data);
      }
    } catch (err) {
      showStatus({text: "Could not connect to backend!", type: "error"});
      console.error("Error: Could not connect to backend!", err);
    }
  };

  const handleUpload = (document: ILibraryCard) => {
    setDocuments((prev) => prev ? [document, ...prev] : [document]);
  }

  const handleDelete = async (documentID: string) => {
    const response = await fetch(`${API_BASE}/documents/${documentID}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (response.ok) {
      const deletedID: string = data.documentId;
      setDocuments((prev) => prev ? prev.filter((doc) => doc.id !== deletedID) : []);
      showStatus({text: "Document was deleted successfully!", type: "success"});
    } else {
      showStatus({text: "Failed to delete document!", type: "error"});
      console.error("Error: Failed to delete document!", data);
      throw new Error(data.detail ?? "Failed to delete document!");
    }
  }

  // Function used for Websockets connections
  const handleStatusUpdate = (documentId: string, status: string, pages: string) => {
    const nrPages: number = Number.parseInt(pages);

    setDocuments((prev) => 
      prev ? prev.map((doc) => doc.id === documentId ? {...doc, status, nrPages} : doc) : prev
    );
  }

  useEffect(() => {
    fetchDocuments()
  }, []);

  useEffect(() => {
    const socket = new WebSocket(`${WS_BASE}/documents`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleStatusUpdate(data.documentId, data.status, data.pages);
    }

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    }

    return () => {
      socket.close()
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Knowledge Library"
        subtitle="Manage your uploaded courses, research papers, and study materials."
        actions={
          <>
            <div className="relative w-full sm:w-80">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-300" strokeWidth={2.5} />
              <input
                type="search"
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Search documents..."
                className="w-full rounded-xl bg-white/5 py-3 pl-12 pr-4 text-sm text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[6px] placeholder:text-neutral-300/50 focus:outline-cyan-400/50 [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10"
                aria-label="Filter documents"
              >
                <SlidersHorizontalIcon className="size-4" />
              </button>

              <UploadButton
                onUpload={handleUpload} 
              />
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {documents && documents.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-xl bg-white/5 px-6 py-16 text-center outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <span className="flex size-14 items-center justify-center rounded-full bg-cyan-400/10 outline outline-1 outline-offset-[-1px] outline-cyan-400/20">
              <FileXIcon className="size-6 text-cyan-400/80" />
            </span>

            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-zinc-200">No documents yet</h2>
              <p className="max-w-sm text-sm text-neutral-400">
                You haven't uploaded any materials. Upload your first document to get started.
              </p>
            </div>
          </div>
        ) : searchedDocuments && searchedDocuments.length > 0 ? (
          searchedDocuments.map((doc) => (
            <LibraryCard 
              key={doc.id}
              card={doc}
              onDeleteCard={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-xl bg-white/5 px-6 py-16 text-center outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <span className="flex size-14 items-center justify-center rounded-full bg-cyan-400/10 outline outline-1 outline-offset-[-1px] outline-cyan-400/20">
              <SearchXIcon className="size-6 text-cyan-400/80" />
            </span>

            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-zinc-200">No documents found</h2>
              <p className="max-w-sm text-sm text-neutral-400">
                Nothing matches your search or filters. Try a different keyword or clear your filters to see all your documents.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}