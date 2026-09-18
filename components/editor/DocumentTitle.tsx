"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/stores/store";
import { Edit2, Check } from "lucide-react";
import { DEFAULT_DOCUMENT_TITLE } from "@/lib/document";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function DocumentTitle() {
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);
  const isDirty = useStore((state) => state.isDirty);
  const { t } = useI18n();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(currentDocument?.title || "");
  }, [currentDocument?.title]);

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.focus();
      node.select();
    }
  }, []);

  const handleSave = () => {
    if (title.trim()) {
      updateDocumentTitle(title.trim());
    } else {
      setTitle(currentDocument?.title || DEFAULT_DOCUMENT_TITLE);
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
    <div className="h-14 bg-bg-primary flex items-center px-4 border-b border-border-light">
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <label htmlFor="document-title" className="sr-only">{t("editor.documentTitle")}</label>
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
            aria-label={t("editor.saveTitle")}
            className="text-plum hover:opacity-70 transition-opacity rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <Check size={20} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <h2 className="text-text-primary font-semibold text-base truncate">
            {currentDocument.title || DEFAULT_DOCUMENT_TITLE}
          </h2>
          <span
            aria-live="polite"
            className={`text-xs text-text-muted ml-2 transition-opacity duration-200 ${isDirty ? "" : "opacity-50"}`}
          >
            {isDirty ? t("editor.unsaved") : t("editor.saved")}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            aria-label={t("editor.editTitle")}
            title={t("editor.renameDocument")}
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
