"use client";

import { useStore } from "@/stores/store";
import { FileText } from "lucide-react";

export function DocumentList() {
  const documents = useStore((state) => state.documents);
  const currentDocument = useStore((state) => state.currentDocument);
  const selectDocument = useStore((state) => state.selectDocument);

  return (
    <ul className="space-y-1">
      {documents.map((doc) => (
        <li key={doc.id}>
          <button
            onClick={() => selectDocument(doc.id)}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm transition-colors ${
              currentDocument?.id === doc.id
                ? "bg-bg-highlight text-text-invert"
                : "text-dropdown-link hover:bg-bg-highlight/50"
            }`}
          >
            <FileText size={16} />
            <span className="truncate">{doc.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
