"use client";

import { useState, useEffect, useRef } from "react";
import { useDropbox } from "@/hooks/useDropbox";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import {
  X,
  Cloud,
  ArrowLeft,
  Folder,
  FileText,
  Save,
} from "lucide-react";

type Mode = "import" | "save";

interface DropboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
}

export function DropboxModal({ isOpen, onClose, mode }: DropboxModalProps) {
  const dropbox = useDropbox();
  const { notify } = useToast();
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocumentBody = useStore((state) => state.updateDocumentBody);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [newFileName, setNewFileName] = useState("");

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && dropbox.isConnected) {
      dropbox.fetchFiles("");
      setNewFileName(currentDocument?.title || "document");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dropbox.isConnected]);

  if (!isOpen) return null;

  const handleItemClick = async (item: { name: string; path: string; isFolder: boolean }) => {
    if (item.isFolder) {
      dropbox.navigateToFolder(item.path);
    } else if (mode === "import") {
      const file = await dropbox.fetchFileContent(item.path);
      if (file) {
        updateDocumentBody(file.content);
        updateDocumentTitle(file.name.replace(/\.md$/, ""));
        notify("File imported from Dropbox");
        onClose();
      }
    }
  };

  const handleSave = async () => {
    if (!currentDocument) return;

    const fileName = newFileName.endsWith(".md") ? newFileName : `${newFileName}.md`;
    const path = dropbox.currentPath ? `${dropbox.currentPath}/${fileName}` : `/${fileName}`;

    const success = await dropbox.saveFile(path, currentDocument.body);
    if (success) {
      onClose();
    }
  };

  // Not connected state
  if (!dropbox.isConnected) {
    return (
      <div
        className="fixed inset-0 z-modal flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dropbox-connect-title"
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-md p-6">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-text-invert hover:text-plum rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <Cloud size={48} className="mx-auto text-text-invert mb-4" aria-hidden="true" />
            <h2 id="dropbox-connect-title" className="text-xl font-semibold text-text-invert mb-2 text-balance">
              Connect to Dropbox
            </h2>
            <p className="text-text-muted mb-6">
              Connect your Dropbox account to import and save markdown files.
            </p>
            <button
              onClick={dropbox.connect}
              className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium
                         hover:opacity-90 transition-opacity
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
            >
              Connect Dropbox
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dropbox-modal-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <div className="flex items-center gap-2">
            {dropbox.pathHistory.length > 0 && (
              <button
                onClick={dropbox.navigateBack}
                aria-label="Go back"
                className="text-text-invert hover:text-plum rounded
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Cloud size={24} className="text-text-invert" aria-hidden="true" />
            <h2 id="dropbox-modal-title" className="text-lg font-semibold text-text-invert text-balance">
              {mode === "import" ? "Import from Dropbox" : "Save to Dropbox"}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="text-text-invert hover:text-plum rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current path */}
        <div className="px-4 py-2 text-sm text-text-muted border-b border-border-settings">
          {dropbox.currentPath || "/"}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {mode === "save" && (
            <div className="mb-4 p-3 bg-bg-highlight rounded">
              <label htmlFor="dropbox-filename" className="block text-sm text-text-muted mb-1">
                File name
              </label>
              <input
                id="dropbox-filename"
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="document.md"
                className="w-full bg-bg-navbar text-text-invert px-3 py-2 rounded
                           border border-border-settings
                           focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
              />
            </div>
          )}

          {dropbox.files.length === 0 ? (
            <p className="text-text-muted text-center py-4">
              No files found
            </p>
          ) : (
            <div className="space-y-1">
              {dropbox.files.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item)}
                  className="w-full text-left px-3 py-2 rounded text-text-invert
                             hover:bg-bg-highlight flex items-center gap-2
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                >
                  {item.isFolder ? (
                    <Folder size={16} className="text-text-muted" aria-hidden="true" />
                  ) : (
                    <FileText size={16} className="text-text-muted" aria-hidden="true" />
                  )}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === "save" && (
          <div className="p-4 border-t border-border-settings">
            <button
              onClick={handleSave}
              className="w-full bg-plum text-bg-sidebar py-2 px-4 rounded font-medium
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
            >
              <Save size={18} />
              Save to Dropbox
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
