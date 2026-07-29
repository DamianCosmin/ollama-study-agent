import { useState, useRef, useEffect, ChangeEvent } from "react";
import { UploadCloudIcon, XIcon } from "lucide-react";
import { API_BASE, ILibraryCard } from "../utils/types.ts";

export default function UploadButton() {
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const hiddenInput = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
  const ALLOWED_TYPES = [
    "application/pdf", // .pdf
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx
  ];

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleClick = () => {
    hiddenInput.current?.click();
  }

  const clearStatus = () => {
    setStatus("");
  }

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const selectedFile = event.target.files[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setStatus("Error: File exceeds 20 MB limit!");
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setStatus("Error: Only PDF, DOCX, and PPTX are allowed!");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_BASE}/documents`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // TO-DO: Update cards using Websockets instead of displaying the pop-up
      if (response.ok) {
        const document: ILibraryCard = data.document;
        setStatus(`Success! Uploaded ${document.title}`);
      } else {
        setStatus("Error: Upload failed!");
      }
    } catch (err) {
      setStatus("Error: Could not connect to the backend!");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <input className="hidden"
        type="file"
        accept=".pdf,.docx,.pptx"
        ref={hiddenInput}
        onChange={handleUpload}
      />
      
      <button
        type="button"
        className="group relative flex h-12 shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl bg-linear-76 from-cyan-400 to-emerald-300 px-6 text-sm font-bold tracking-wide text-neutral-900 shadow-[0px_0px_20px_0px_rgba(0,245,255,0.45)] outline outline-1 outline-offset-[-1px] outline-white/30 transition-transform hover:scale-[1.02]"
        disabled={isUploading}
        onClick={handleClick}
      >
        <UploadCloudIcon className="size-4" strokeWidth={2.5} />
          Upload
        <span className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/40 to-white/0" />
      </button>

      {status && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-white/25 px-5 py-2.5 backdrop-blur-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 shadow-[0px_8px_24px_0px_rgba(0,220,229,0.10)] animate-in fade-in slide-in-from-bottom-5">
          <div 
            className={`h-2.5 w-2.5 rounded-full ${status.startsWith("Error") 
              ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]" 
              : "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
            }`} 
          />

          <p className="text-sm font-bold tracking-wide text-zinc-200">
            {status}
          </p>

          <button 
            onClick={clearStatus} 
            className="ml-1 rounded-full p-1.5 text-neutral-300 transition-colors hover:bg-white/10 hover:text-neutral-100"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}