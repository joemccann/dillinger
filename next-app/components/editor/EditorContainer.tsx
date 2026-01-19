"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
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
  const zenMode = useStore((state) => state.zenMode);
  const setZenMode = useStore((state) => state.setZenMode);

  // Keyboard shortcuts for zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + Z for zen mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        setZenMode(!zenMode);
      }
      // Escape to exit zen mode
      if (e.key === "Escape" && zenMode) {
        setZenMode(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [zenMode, setZenMode]);

  // Show structural skeleton while hydrating
  if (!currentDocument) {
    return <EditorSkeleton />;
  }

  // Zen mode - fullscreen distraction-free editor
  if (zenMode) {
    return (
      <div className="h-dvh bg-bg-primary flex items-center justify-center">
        <div className="w-full max-w-3xl h-full py-12 px-4 relative">
          <button
            onClick={() => setZenMode(false)}
            className="absolute top-4 right-4 text-text-muted hover:text-text-invert transition-colors rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            aria-label="Exit zen mode"
          >
            <X size={24} />
          </button>
          <div className="h-full border border-border-light rounded-lg overflow-hidden">
            <MonacoEditor />
          </div>
        </div>
      </div>
    );
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
