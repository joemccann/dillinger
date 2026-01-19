"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/stores/store";
import { Edit2, Check } from "lucide-react";

export function DocumentTitle() {
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(currentDocument?.title || "");
  }, [currentDocument?.title]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (title.trim()) {
      updateDocumentTitle(title.trim());
    } else {
      setTitle(currentDocument?.title || "Untitled");
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTitle(currentDocument?.title || "");
      setIsEditing(false);
    }
  };

  if (!currentDocument) return null;

  return (
    <div className="h-12 bg-border-light flex items-center px-4 border-b border-border-light">
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <label htmlFor="document-title" className="sr-only">Document title</label>
          <input
            ref={inputRef}
            id="document-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-white px-2 py-1 rounded border border-border-light
                       text-text-primary
                       focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          />
          <button
            onClick={handleSave}
            aria-label="Save title"
            className="text-plum hover:opacity-70 transition-opacity rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <Check size={20} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <h2 className="text-text-primary font-medium truncate">
            {currentDocument.title}
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            aria-label="Edit title"
            className="text-text-muted hover:text-plum transition-colors rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <Edit2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
