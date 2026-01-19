"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar/Navbar";
import { DocumentTitle } from "@/components/editor/DocumentTitle";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { useStore } from "@/stores/store";
import { EditorSkeleton } from "@/components/ui/Skeleton";

// Dynamic import Sidebar to prevent SSR issues with GitHub/Dropbox hooks
const Sidebar = dynamic(
  () => import("@/components/sidebar/Sidebar").then((mod) => mod.Sidebar),
  { ssr: false }
);

function EditorContent() {
  const previewVisible = useStore((state) => state.previewVisible);
  const currentDocument = useStore((state) => state.currentDocument);

  // Show structural skeleton while hydrating
  if (!currentDocument) {
    return <EditorSkeleton />;
  }

  return (
    <div className="h-dvh flex overflow-hidden">
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

export function EditorContainer() {
  return (
    <StoreProvider>
      <ToastProvider>
        <EditorContent />
      </ToastProvider>
    </StoreProvider>
  );
}
