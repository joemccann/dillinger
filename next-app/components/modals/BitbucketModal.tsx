"use client";

import { useState, useEffect, useRef } from "react";
import { useBitbucket } from "@/hooks/useBitbucket";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import {
  X,
  GitBranch,
  ArrowLeft,
  Folder,
  FileText,
  Save,
  ChevronDown,
} from "lucide-react";

type Mode = "import" | "save";

interface BitbucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
}

export function BitbucketModal({ isOpen, onClose, mode }: BitbucketModalProps) {
  const bitbucket = useBitbucket();
  const { notify } = useToast();
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocumentBody = useStore((state) => state.updateDocumentBody);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [newFileName, setNewFileName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

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
    if (isOpen && bitbucket.isConnected) {
      bitbucket.fetchWorkspaces();
      setNewFileName(currentDocument?.title || "document");
      setCommitMessage("");
      setSelectedFilePath(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bitbucket.isConnected]);

  if (!isOpen) return null;

  const handleItemClick = async (item: { path: string; name: string; isFolder: boolean }) => {
    if (item.isFolder) {
      bitbucket.navigateToFolder(item.path);
    } else if (mode === "import") {
      const file = await bitbucket.fetchFileContent(item.path);
      if (file) {
        updateDocumentBody(file.content);
        updateDocumentTitle(file.name.replace(/\.md$/, ""));
        notify("File imported from Bitbucket");
        onClose();
      }
    } else {
      // Save mode - select file to overwrite
      setSelectedFilePath(item.path);
      setNewFileName(item.name.replace(/\.md$/, ""));
    }
  };

  const handleSave = async () => {
    if (!currentDocument) return;

    const fileName = newFileName.endsWith(".md") ? newFileName : `${newFileName}.md`;
    const filePath = selectedFilePath || (bitbucket.currentPath ? `${bitbucket.currentPath}/${fileName}` : fileName);

    const success = await bitbucket.saveFile(
      filePath,
      currentDocument.body,
      commitMessage || `Update ${fileName}`
    );

    if (success) {
      onClose();
    }
  };

  // Not connected state
  if (!bitbucket.isConnected) {
    return (
      <div
        className="fixed inset-0 z-modal flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bitbucket-connect-title"
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
            <GitBranch size={48} className="mx-auto text-text-invert mb-4" aria-hidden="true" />
            <h2 id="bitbucket-connect-title" className="text-xl font-semibold text-text-invert mb-2 text-balance">
              Connect to Bitbucket
            </h2>
            <p className="text-text-muted mb-6">
              Connect your Bitbucket account to import and save markdown files.
            </p>
            <button
              onClick={bitbucket.connect}
              className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium
                         hover:opacity-90 transition-opacity
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
            >
              Connect Bitbucket
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
      aria-labelledby="bitbucket-modal-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <div className="flex items-center gap-2">
            {bitbucket.pathHistory.length > 0 && (
              <button
                onClick={bitbucket.navigateBack}
                aria-label="Go back"
                className="text-text-invert hover:text-plum rounded
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <GitBranch size={24} className="text-text-invert" aria-hidden="true" />
            <h2 id="bitbucket-modal-title" className="text-lg font-semibold text-text-invert text-balance">
              {mode === "import" ? "Import from Bitbucket" : "Save to Bitbucket"}
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Selectors */}
          <div className="space-y-3 mb-4">
            {/* Workspace selector */}
            <div className="relative">
              <label htmlFor="workspace" className="block text-sm text-text-muted mb-1">
                Workspace
              </label>
              <div className="relative">
                <select
                  id="workspace"
                  value={bitbucket.selectedWorkspace || ""}
                  onChange={(e) => bitbucket.selectWorkspace(e.target.value)}
                  className="w-full bg-bg-highlight text-text-invert px-3 py-2 rounded
                             border border-border-settings appearance-none
                             focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                >
                  <option value="">Select workspace</option>
                  {bitbucket.workspaces.map((ws) => (
                    <option key={ws.slug} value={ws.slug}>{ws.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Repo selector */}
            {bitbucket.selectedWorkspace && (
              <div className="relative">
                <label htmlFor="repo" className="block text-sm text-text-muted mb-1">
                  Repository
                </label>
                <div className="relative">
                  <select
                    id="repo"
                    value={bitbucket.selectedRepo || ""}
                    onChange={(e) => bitbucket.selectRepo(e.target.value)}
                    className="w-full bg-bg-highlight text-text-invert px-3 py-2 rounded
                               border border-border-settings appearance-none
                               focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                  >
                    <option value="">Select repository</option>
                    {bitbucket.repos.map((repo) => (
                      <option key={repo.slug} value={repo.slug}>{repo.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>
            )}

            {/* Branch selector */}
            {bitbucket.selectedRepo && (
              <div className="relative">
                <label htmlFor="branch" className="block text-sm text-text-muted mb-1">
                  Branch
                </label>
                <div className="relative">
                  <select
                    id="branch"
                    value={bitbucket.selectedBranch || ""}
                    onChange={(e) => bitbucket.selectBranch(e.target.value)}
                    className="w-full bg-bg-highlight text-text-invert px-3 py-2 rounded
                               border border-border-settings appearance-none
                               focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                  >
                    <option value="">Select branch</option>
                    {bitbucket.branches.map((branch) => (
                      <option key={branch.name} value={branch.name}>{branch.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Save mode inputs */}
          {mode === "save" && bitbucket.selectedBranch && (
            <div className="space-y-3 mb-4 p-3 bg-bg-highlight rounded">
              <div>
                <label htmlFor="bitbucket-filename" className="block text-sm text-text-muted mb-1">
                  File name
                </label>
                <input
                  id="bitbucket-filename"
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="document.md"
                  className="w-full bg-bg-navbar text-text-invert px-3 py-2 rounded
                             border border-border-settings
                             focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                />
              </div>
              <div>
                <label htmlFor="commit-message" className="block text-sm text-text-muted mb-1">
                  Commit message
                </label>
                <input
                  id="commit-message"
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Update document"
                  className="w-full bg-bg-navbar text-text-invert px-3 py-2 rounded
                             border border-border-settings
                             focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                />
              </div>
            </div>
          )}

          {/* File list */}
          {bitbucket.selectedBranch && (
            <>
              {bitbucket.files.length === 0 ? (
                <p className="text-text-muted text-center py-4">
                  No files found
                </p>
              ) : (
                <div className="space-y-1">
                  {bitbucket.files.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleItemClick(item)}
                      className={`w-full text-left px-3 py-2 rounded text-text-invert
                                 hover:bg-bg-highlight flex items-center gap-2
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum
                                 ${selectedFilePath === item.path ? "bg-bg-highlight" : ""}`}
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
            </>
          )}
        </div>

        {/* Footer */}
        {mode === "save" && bitbucket.selectedBranch && (
          <div className="p-4 border-t border-border-settings">
            <button
              onClick={handleSave}
              className="w-full bg-plum text-bg-sidebar py-2 px-4 rounded font-medium
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
            >
              <Save size={18} />
              Save to Bitbucket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
