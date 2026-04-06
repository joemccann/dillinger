"use client";

import { useReducer, memo, useCallback } from "react";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import { useGitHub } from "@/hooks/useGitHub";
import { useDropbox } from "@/hooks/useDropbox";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import { useOneDrive } from "@/hooks/useOneDrive";
import { useBitbucket } from "@/hooks/useBitbucket";
import { DocumentList } from "./DocumentList";
import { GitHubModal } from "@/components/modals/GitHubModal";
import { DropboxModal } from "@/components/modals/DropboxModal";
import { GoogleDriveModal } from "@/components/modals/GoogleDriveModal";
import { OneDriveModal } from "@/components/modals/OneDriveModal";
import { BitbucketModal } from "@/components/modals/BitbucketModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import {
  Plus,
  Save,
  Trash2,
  Github,
  Cloud,
  HardDrive,
  CloudCog,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Plug,
  CloudDownload,
  CloudUpload,
  FileText,
} from "lucide-react";

type ModalMode = "import" | "save";
type ModalTarget = "github" | "dropbox" | "googleDrive" | "oneDrive" | "bitbucket";

interface SidebarUIState {
  servicesOpen: boolean;
  importOpen: boolean;
  saveOpen: boolean;
  documentsOpen: boolean;
  activeModal: { target: ModalTarget; mode: ModalMode } | null;
  deleteModalOpen: boolean;
}

type SidebarAction =
  | { type: "toggle"; section: "servicesOpen" | "importOpen" | "saveOpen" | "documentsOpen" }
  | { type: "openModal"; target: ModalTarget; mode: ModalMode }
  | { type: "closeModal" }
  | { type: "openDeleteModal" }
  | { type: "closeDeleteModal" };

const initialUIState: SidebarUIState = {
  servicesOpen: false,
  importOpen: false,
  saveOpen: false,
  documentsOpen: true,
  activeModal: null,
  deleteModalOpen: false,
};

function uiReducer(state: SidebarUIState, action: SidebarAction): SidebarUIState {
  switch (action.type) {
    case "toggle":
      return { ...state, [action.section]: !state[action.section] };
    case "openModal":
      return { ...state, activeModal: { target: action.target, mode: action.mode } };
    case "closeModal":
      return { ...state, activeModal: null };
    case "openDeleteModal":
      return { ...state, deleteModalOpen: true };
    case "closeDeleteModal":
      return { ...state, deleteModalOpen: false };
  }
}

export function Sidebar() {
  const sidebarOpen = useStore((state) => state.sidebarOpen);
  const documents = useStore((state) => state.documents);
  const currentDocument = useStore((state) => state.currentDocument);
  const createDocument = useStore((state) => state.createDocument);
  const deleteDocument = useStore((state) => state.deleteDocument);
  const persist = useStore((state) => state.persist);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const { notify } = useToast();

  const [ui, dispatch] = useReducer(uiReducer, initialUIState);

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
    dispatch({ type: "openDeleteModal" });
  }, [currentDocument, documents.length, notify]);

  const handleDeleteConfirm = useCallback(() => {
    if (!currentDocument) return;
    deleteDocument(currentDocument.id);
    notify("Document deleted");
    dispatch({ type: "closeDeleteModal" });
  }, [currentDocument, deleteDocument, notify]);

  if (!sidebarOpen) return null;

  const closeModal = () => dispatch({ type: "closeModal" });

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-sidebar sm:hidden"
        onClick={toggleSidebar}
        aria-hidden="true"
      />
      <aside className="fixed sm:relative w-sidebar bg-bg-sidebar h-dvh flex flex-col z-sidebar">
        <div className="pt-4" />

        {/* Navigation */}
        <nav className="flex-1 overflow-auto px-4">
          <CollapsibleSection
            label="Services"
            panelId="services-panel"
            icon={<Plug size={14} />}
            isOpen={ui.servicesOpen}
            onToggle={() => dispatch({ type: "toggle", section: "servicesOpen" })}
          >
            <CloudServicesList />
          </CollapsibleSection>

          <CloudServiceMenu
            label="Import from"
            panelId="import-panel"
            icon={<CloudDownload size={14} />}
            isOpen={ui.importOpen}
            onToggle={() => dispatch({ type: "toggle", section: "importOpen" })}
            onSelect={(target) => dispatch({ type: "openModal", target, mode: "import" })}
          />

          <CloudServiceMenu
            label="Save to"
            panelId="save-panel"
            icon={<CloudUpload size={14} />}
            isOpen={ui.saveOpen}
            onToggle={() => dispatch({ type: "toggle", section: "saveOpen" })}
            onSelect={(target) => dispatch({ type: "openModal", target, mode: "save" })}
          />

          <CollapsibleSection
            label="Documents"
            panelId="documents-panel"
            icon={<FileText size={14} />}
            isOpen={ui.documentsOpen}
            onToggle={() => dispatch({ type: "toggle", section: "documentsOpen" })}
          >
            <DocumentList />
          </CollapsibleSection>
        </nav>

        {/* Actions */}
        <div className="p-4 space-y-3 border-t border-border-settings">
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
          <button
            onClick={handleDeleteClick}
            disabled={documents.length <= 1}
            className={`w-full bg-red-600 text-text-invert py-2 px-4 rounded font-medium
                       flex items-center justify-center gap-2
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sidebar
                       ${documents.length <= 1 ? "opacity-60 cursor-not-allowed" : "hover:opacity-90 transition-opacity"}`}
          >
            <Trash2 size={18} />
            Delete Document
          </button>
        </div>
      </aside>

      {/* Modals */}
      <GitHubModal
        isOpen={ui.activeModal?.target === "github"}
        onClose={closeModal}
        mode={ui.activeModal?.mode ?? "import"}
      />
      <DropboxModal
        isOpen={ui.activeModal?.target === "dropbox"}
        onClose={closeModal}
        mode={ui.activeModal?.mode ?? "import"}
      />
      <GoogleDriveModal
        isOpen={ui.activeModal?.target === "googleDrive"}
        onClose={closeModal}
        mode={ui.activeModal?.mode ?? "import"}
      />
      <OneDriveModal
        isOpen={ui.activeModal?.target === "oneDrive"}
        onClose={closeModal}
        mode={ui.activeModal?.mode ?? "import"}
      />
      <BitbucketModal
        isOpen={ui.activeModal?.target === "bitbucket"}
        onClose={closeModal}
        mode={ui.activeModal?.mode ?? "import"}
      />
      <DeleteConfirmModal
        isOpen={ui.deleteModalOpen}
        onClose={() => dispatch({ type: "closeDeleteModal" })}
        onConfirm={handleDeleteConfirm}
        documentTitle={currentDocument?.title || ""}
      />
    </>
  );
}

function CollapsibleSection({
  label,
  panelId,
  isOpen,
  onToggle,
  icon,
  children,
}: {
  label: string;
  panelId: string;
  isOpen: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between py-2 text-text-muted text-xs uppercase tracking-wider rounded
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
      >
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && (
        <div id={panelId} className="ml-2 space-y-1 mt-1">
          {children}
        </div>
      )}
    </div>
  );
}

const CLOUD_SERVICES: { target: ModalTarget; icon: React.ReactNode; label: string }[] = [
  { target: "github", icon: <Github size={16} />, label: "GitHub" },
  { target: "dropbox", icon: <Cloud size={16} />, label: "Dropbox" },
  { target: "googleDrive", icon: <HardDrive size={16} />, label: "Google Drive" },
  { target: "oneDrive", icon: <CloudCog size={16} />, label: "OneDrive" },
  { target: "bitbucket", icon: <GitBranch size={16} />, label: "Bitbucket" },
];

function CloudServiceMenu({
  label,
  panelId,
  isOpen,
  onToggle,
  onSelect,
  icon,
}: {
  label: string;
  panelId: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (target: ModalTarget) => void;
  icon?: React.ReactNode;
}) {
  return (
    <CollapsibleSection label={label} panelId={panelId} isOpen={isOpen} onToggle={onToggle} icon={icon}>
      {CLOUD_SERVICES.map((service) => (
        <button
          key={service.target}
          onClick={() => onSelect(service.target)}
          className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
        >
          {service.icon}
          <span>{service.label}</span>
        </button>
      ))}
    </CollapsibleSection>
  );
}

function CloudServicesList() {
  const github = useGitHub();
  const dropbox = useDropbox();
  const googleDrive = useGoogleDrive();
  const oneDrive = useOneDrive();
  const bitbucket = useBitbucket();

  return (
    <>
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
      <ServiceButton
        icon={<GitBranch size={16} />}
        label="Bitbucket"
        connected={bitbucket.isConnected}
        onConnect={bitbucket.connect}
        onDisconnect={bitbucket.disconnect}
      />
    </>
  );
}

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
