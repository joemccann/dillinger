"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { Navbar } from "@/components/navbar/Navbar";
import { DocumentTitle } from "@/components/editor/DocumentTitle";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { useStore } from "@/stores/store";

export default function EditorPage() {
  const previewVisible = useStore((state) => state.previewVisible);
  const currentDocument = useStore((state) => state.currentDocument);

  // Show loading state while hydrating
  if (!currentDocument) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <DocumentTitle />

        {/* Editor + Preview */}
        <div className="flex-1 flex min-h-0">
          {/* Editor Panel */}
          <div
            className={`${
              previewVisible ? "w-1/2" : "w-full"
            } border-r border-border-light`}
          >
            <MonacoEditor />
          </div>

          {/* Preview Panel */}
          {previewVisible && (
            <div className="w-1/2">
              <MarkdownPreview />
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
}
