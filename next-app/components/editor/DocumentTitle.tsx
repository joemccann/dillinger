"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/stores/store";
import { Edit2, Check } from "lucide-react";

export function DocumentTitle() {
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(currentDocument?.title || "");
  }, [currentDocument?.title]);

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
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-white px-2 py-1 rounded border border-border-light
                       focus:outline-none focus:border-plum text-text-primary"
          />
          <button
            onClick={handleSave}
            className="text-plum hover:opacity-70 transition-opacity"
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
            className="text-text-muted hover:text-plum transition-colors"
          >
            <Edit2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
