"use client";

import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import { DocumentList } from "./DocumentList";
import { Plus, Save, Trash2 } from "lucide-react";

export function Sidebar() {
  const sidebarOpen = useStore((state) => state.sidebarOpen);
  const documents = useStore((state) => state.documents);
  const currentDocument = useStore((state) => state.currentDocument);
  const createDocument = useStore((state) => state.createDocument);
  const deleteDocument = useStore((state) => state.deleteDocument);
  const persist = useStore((state) => state.persist);
  const { notify } = useToast();

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
    <aside className="w-sidebar bg-bg-sidebar h-screen flex flex-col z-sidebar">
      {/* Logo */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-plum">DILLINGER</h1>
      </div>

      {/* Documents Section */}
      <div className="flex-1 overflow-auto px-4">
        <h2 className="text-xs uppercase tracking-wider text-text-muted mb-2">
          Documents
        </h2>
        <DocumentList />
      </div>

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
  );
}
