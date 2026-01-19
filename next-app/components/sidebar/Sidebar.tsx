"use client";

import { useState, memo, useCallback } from "react";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import { useGitHub } from "@/hooks/useGitHub";
import { useDropbox } from "@/hooks/useDropbox";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import { useOneDrive } from "@/hooks/useOneDrive";
import { DocumentList } from "./DocumentList";
import { GitHubModal } from "@/components/modals/GitHubModal";
import { DropboxModal } from "@/components/modals/DropboxModal";
import { GoogleDriveModal } from "@/components/modals/GoogleDriveModal";
import { OneDriveModal } from "@/components/modals/OneDriveModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import {
  Plus,
  Save,
  Trash2,
  Github,
  Cloud,
  HardDrive,
  CloudCog,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const sidebarOpen = useStore((state) => state.sidebarOpen);
  const documents = useStore((state) => state.documents);
  const currentDocument = useStore((state) => state.currentDocument);
  const createDocument = useStore((state) => state.createDocument);
  const deleteDocument = useStore((state) => state.deleteDocument);
  const persist = useStore((state) => state.persist);
  const { notify } = useToast();

  const github = useGitHub();
  const dropbox = useDropbox();
  const googleDrive = useGoogleDrive();
  const oneDrive = useOneDrive();

  const [servicesOpen, setServicesOpen] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(true);

  const [githubModal, setGithubModal] = useState<{ open: boolean; mode: "import" | "save" }>({
    open: false,
    mode: "import",
  });
  const [dropboxModal, setDropboxModal] = useState<{ open: boolean; mode: "import" | "save" }>({
    open: false,
    mode: "import",
  });
  const [googleDriveModal, setGoogleDriveModal] = useState<{ open: boolean; mode: "import" | "save" }>({
    open: false,
    mode: "import",
  });
  const [oneDriveModal, setOneDriveModal] = useState<{ open: boolean; mode: "import" | "save" }>({
    open: false,
    mode: "import",
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSave = useCallback(() => {
    persist();
    notify("Documents saved");
  }, [persist, notify]);

  const handleDeleteClick = useCallback(() => {
    if (!currentDocument) return;
    if (documents.length <= 1) {
      notify("Cannot delete the last document");
      return;
    }
    setDeleteModalOpen(true);
  }, [currentDocument, documents.length, notify]);

  const handleDeleteConfirm = useCallback(() => {
    if (!currentDocument) return;
    deleteDocument(currentDocument.id);
    notify("Document deleted");
    setDeleteModalOpen(false);
  }, [currentDocument, deleteDocument, notify]);

  if (!sidebarOpen) return null;

  return (
    <>
      <aside className="w-sidebar bg-bg-sidebar h-dvh flex flex-col z-sidebar">
        {/* Logo */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-plum text-balance">DILLINGER</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto px-4">
          {/* Services Section */}
          <div className="mb-2">
            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              aria-expanded={servicesOpen}
              aria-controls="services-panel"
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm rounded
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            >
              <span>Services</span>
              {servicesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {servicesOpen && (
              <div id="services-panel" className="ml-2 space-y-1">
                <ServiceButton
                  icon={<Github size={16} />}
                  label="GitHub"
                  connected={github.isConnected}
                  onConnect={github.connect}
                  onDisconnect={github.disconnect}
                />
                <ServiceButton
                  icon={<Cloud size={16} />}
                  label="Dropbox"
                  connected={dropbox.isConnected}
                  onConnect={dropbox.connect}
                  onDisconnect={dropbox.disconnect}
                />
                <ServiceButton
                  icon={<HardDrive size={16} />}
                  label="Google Drive"
                  connected={googleDrive.isConnected}
                  onConnect={googleDrive.connect}
                  onDisconnect={googleDrive.disconnect}
                />
                <ServiceButton
                  icon={<CloudCog size={16} />}
                  label="OneDrive"
                  connected={oneDrive.isConnected}
                  onConnect={oneDrive.connect}
                  onDisconnect={oneDrive.disconnect}
                />
              </div>
            )}
          </div>

          {/* Import From Section */}
          <div className="mb-2">
            <button
              onClick={() => setImportOpen(!importOpen)}
              aria-expanded={importOpen}
              aria-controls="import-panel"
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm rounded
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            >
              <span>Import from</span>
              {importOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {importOpen && (
              <div id="import-panel" className="ml-2 space-y-1">
                <button
                  onClick={() => setGithubModal({ open: true, mode: "import" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </button>
                <button
                  onClick={() => setDropboxModal({ open: true, mode: "import" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                >
                  <Cloud size={16} />
                  <span>Dropbox</span>
                </button>
                <button
                  onClick={() => setGoogleDriveModal({ open: true, mode: "import" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                >
                  <HardDrive size={16} />
                  <span>Google Drive</span>
                </button>
                <button
                  onClick={() => setOneDriveModal({ open: true, mode: "import" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                >
                  <CloudCog size={16} />
                  <span>OneDrive</span>
                </button>
              </div>
            )}
          </div>

          {/* Save To Section */}
          <div className="mb-2">
            <button
              onClick={() => setSaveOpen(!saveOpen)}
              aria-expanded={saveOpen}
              aria-controls="save-panel"
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm rounded
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            >
              <span>Save to</span>
              {saveOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {saveOpen && (
              <div id="save-panel" className="ml-2 space-y-1">
                <button
                  onClick={() => setGithubModal({ open: true, mode: "save" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </button>
                <button
                  onClick={() => setDropboxModal({ open: true, mode: "save" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                >
                  <Cloud size={16} />
                  <span>Dropbox</span>
                </button>
                <button
                  onClick={() => setGoogleDriveModal({ open: true, mode: "save" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                >
                  <HardDrive size={16} />
                  <span>Google Drive</span>
                </button>
                <button
                  onClick={() => setOneDriveModal({ open: true, mode: "save" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
                >
                  <CloudCog size={16} />
                  <span>OneDrive</span>
                </button>
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="mb-2">
            <button
              onClick={() => setDocumentsOpen(!documentsOpen)}
              aria-expanded={documentsOpen}
              aria-controls="documents-panel"
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm rounded
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            >
              <span>Documents</span>
              {documentsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {documentsOpen && (
              <div id="documents-panel" className="ml-2">
                <DocumentList />
              </div>
            )}
          </div>
        </nav>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={createDocument}
            className="w-full bg-plum text-bg-sidebar py-2 px-4 rounded font-medium
                       hover:opacity-90 transition-opacity flex items-center justify-center gap-2
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sidebar"
          >
            <Plus size={18} />
            New Document
          </button>
          <button
            onClick={handleSave}
            className="w-full bg-bg-button-save text-text-invert py-2 px-4 rounded font-medium
                       hover:opacity-90 transition-opacity flex items-center justify-center gap-2
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sidebar"
          >
            <Save size={18} />
            Save Session
          </button>
          {documents.length > 1 && (
            <button
              onClick={handleDeleteClick}
              className="w-full bg-red-600 text-text-invert py-2 px-4 rounded font-medium
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sidebar"
            >
              <Trash2 size={18} />
              Delete Document
            </button>
          )}
        </div>
      </aside>

      {/* Modals */}
      <GitHubModal
        isOpen={githubModal.open}
        onClose={() => setGithubModal({ ...githubModal, open: false })}
        mode={githubModal.mode}
      />
      <DropboxModal
        isOpen={dropboxModal.open}
        onClose={() => setDropboxModal({ ...dropboxModal, open: false })}
        mode={dropboxModal.mode}
      />
      <GoogleDriveModal
        isOpen={googleDriveModal.open}
        onClose={() => setGoogleDriveModal({ ...googleDriveModal, open: false })}
        mode={googleDriveModal.mode}
      />
      <OneDriveModal
        isOpen={oneDriveModal.open}
        onClose={() => setOneDriveModal({ ...oneDriveModal, open: false })}
        mode={oneDriveModal.mode}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        documentTitle={currentDocument?.title || ""}
      />
    </>
  );
}

// Memoized to prevent unnecessary re-renders when parent state changes
const ServiceButton = memo(function ServiceButton({
  icon,
  label,
  connected,
  onConnect,
  onDisconnect,
}: {
  icon: React.ReactNode;
  label: string;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-2 text-sm">
      <div className="flex items-center gap-2 text-dropdown-link">
        {icon}
        <span>{label}</span>
      </div>
      {connected ? (
        <button
          onClick={onDisconnect}
          aria-label={`Unlink ${label}`}
          className="text-xs text-red-400 hover:text-red-300 rounded px-1
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          Unlink
        </button>
      ) : (
        <button
          onClick={onConnect}
          aria-label={`Link ${label}`}
          className="text-xs text-plum hover:opacity-80 rounded px-1
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
        >
          Link
        </button>
      )}
    </div>
  );
});
