"use client";

import { useState } from "react";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import { useGitHub } from "@/hooks/useGitHub";
import { useDropbox } from "@/hooks/useDropbox";
import { DocumentList } from "./DocumentList";
import { GitHubModal } from "@/components/modals/GitHubModal";
import { DropboxModal } from "@/components/modals/DropboxModal";
import {
  Plus,
  Save,
  Trash2,
  Github,
  Cloud,
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

  const handleSave = () => {
    persist();
    notify("Documents saved");
  };

  const handleDelete = () => {
    if (!currentDocument) return;
    if (documents.length <= 1) {
      notify("Cannot delete the last document");
      return;
    }
    deleteDocument(currentDocument.id);
    notify("Document deleted");
  };

  if (!sidebarOpen) return null;

  return (
    <>
      <aside className="w-sidebar bg-bg-sidebar h-screen flex flex-col z-sidebar">
        {/* Logo */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-plum">DILLINGER</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto px-4">
          {/* Services Section */}
          <div className="mb-2">
            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm"
            >
              <span>Services</span>
              {servicesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {servicesOpen && (
              <div className="ml-2 space-y-1">
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
              </div>
            )}
          </div>

          {/* Import From Section */}
          <div className="mb-2">
            <button
              onClick={() => setImportOpen(!importOpen)}
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm"
            >
              <span>Import from</span>
              {importOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {importOpen && (
              <div className="ml-2 space-y-1">
                <button
                  onClick={() => setGithubModal({ open: true, mode: "import" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </button>
                <button
                  onClick={() => setDropboxModal({ open: true, mode: "import" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight"
                >
                  <Cloud size={16} />
                  <span>Dropbox</span>
                </button>
              </div>
            )}
          </div>

          {/* Save To Section */}
          <div className="mb-2">
            <button
              onClick={() => setSaveOpen(!saveOpen)}
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm"
            >
              <span>Save to</span>
              {saveOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {saveOpen && (
              <div className="ml-2 space-y-1">
                <button
                  onClick={() => setGithubModal({ open: true, mode: "save" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </button>
                <button
                  onClick={() => setDropboxModal({ open: true, mode: "save" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight"
                >
                  <Cloud size={16} />
                  <span>Dropbox</span>
                </button>
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="mb-2">
            <button
              onClick={() => setDocumentsOpen(!documentsOpen)}
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm"
            >
              <span>Documents</span>
              {documentsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {documentsOpen && (
              <div className="ml-2">
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
                       hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            New Document
          </button>
          <button
            onClick={handleSave}
            className="w-full bg-bg-button-save text-text-invert py-2 px-4 rounded font-medium
                       hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Session
          </button>
          {documents.length > 1 && (
            <button
              onClick={handleDelete}
              className="w-full bg-red-600 text-text-invert py-2 px-4 rounded font-medium
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
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
    </>
  );
}

function ServiceButton({
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
          className="text-xs text-red-400 hover:text-red-300"
        >
          Unlink
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="text-xs text-plum hover:opacity-80"
        >
          Link
        </button>
      )}
    </div>
  );
}
