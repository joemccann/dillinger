"use client";

import { useState, useEffect } from "react";
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

  const [newFileName, setNewFileName] = useState("");

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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-md p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-invert hover:text-plum"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <Cloud size={48} className="mx-auto text-text-invert mb-4" />
            <h2 className="text-xl font-semibold text-text-invert mb-2">
              Connect to Dropbox
            </h2>
            <p className="text-text-muted mb-6">
              Connect your Dropbox account to import and save markdown files.
            </p>
            <button
              onClick={dropbox.connect}
              className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium
                         hover:opacity-90 transition-opacity"
            >
              Connect Dropbox
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <div className="flex items-center gap-2">
            {dropbox.pathHistory.length > 0 && (
              <button
                onClick={dropbox.navigateBack}
                className="text-text-invert hover:text-plum"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Cloud size={24} className="text-text-invert" />
            <h2 className="text-lg font-semibold text-text-invert">
              {mode === "import" ? "Import from Dropbox" : "Save to Dropbox"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-invert hover:text-plum"
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
              <label className="block text-sm text-text-muted mb-1">
                File name
              </label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="document.md"
                className="w-full bg-bg-navbar text-text-invert px-3 py-2 rounded
                           border border-border-settings focus:border-plum outline-none"
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
                             hover:bg-bg-highlight flex items-center gap-2"
                >
                  {item.isFolder ? (
                    <Folder size={16} className="text-text-muted" />
                  ) : (
                    <FileText size={16} className="text-text-muted" />
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
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
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
