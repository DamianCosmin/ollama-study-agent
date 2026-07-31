import { useState, useRef, ChangeEvent } from "react";
import { UploadCloudIcon } from "lucide-react";

import { API_BASE, ILibraryCard, IPopupStatus } from "../utils/types.ts";
import { convertToILibraryCard } from "../utils/functions.ts";
import StatusPopup from "./StatusPopup.tsx";

interface UploadButtonProps {
  onUpload: (document: ILibraryCard) => void;
}

export default function UploadButton({ onUpload }: UploadButtonProps) {
  const [status, setStatus] = useState<IPopupStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const hiddenInput = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
  const ALLOWED_TYPES = [
    "application/pdf", // .pdf
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx
  ];

  const handleClick = () => {
    hiddenInput.current?.click();
  }

  const clearStatus = () => {
    setStatus(null);
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
      setStatus({text: "Error: File exceeds 20 MB limit!", type: "error"});
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setStatus({text: "Error: Only PDF, DOCX, and PPTX are allowed!", type: "error"});
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

      if (response.ok) {
        const document: ILibraryCard = convertToILibraryCard(data.document);
        setStatus({text: `Success! Uploaded ${document.title}`, type: "success"});
        onUpload(document);
      } else {
        setStatus({text: "Error: Upload failed!", type: "error"});
      }
    } catch (err) {
      setStatus({text: "Error: Could not connect to the backend!", type: "error"});
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

      <StatusPopup 
        status={status}
        onClearStatus={clearStatus}
      />
    </>
  );
}