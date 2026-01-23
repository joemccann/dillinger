"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { X, Upload } from "lucide-react";
import { Navbar } from "@/components/navbar/Navbar";
import { DocumentTitle } from "@/components/editor/DocumentTitle";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { useToast } from "@/components/ui/Toast";
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
  const updateDocumentBody = useStore((state) => state.updateDocumentBody);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);
  const zenMode = useStore((state) => state.zenMode);
  const setZenMode = useStore((state) => state.setZenMode);
  const { notify } = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [, setDragCounter] = useState(0);

  // Handle file drop
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];
      const validExtensions = [".md", ".txt", ".markdown"];
      const hasValidExtension = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        notify("Please drop a .md, .txt, or .markdown file");
        return;
      }

      try {
        const content = await file.text();
        const title = file.name.replace(/\.(md|txt|markdown)$/i, "");
        updateDocumentTitle(title);
        updateDocumentBody(content);
        notify(`Imported "${file.name}"`);
      } catch {
        notify("Failed to read file");
      }
    },
    [notify, updateDocumentTitle, updateDocumentBody]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
      }
      return newCounter;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

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
      <div
        className="h-dvh bg-bg-primary flex items-center justify-center relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drop zone overlay for zen mode */}
        {isDragging && (
          <div
            className="absolute inset-0 z-modal bg-bg-primary/90 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="size-20 rounded-full bg-plum/20 flex items-center justify-center">
                <Upload size={40} className="text-plum" />
              </div>
              <div>
                <p className="text-xl font-semibold text-text-invert">
                  Drop your file here
                </p>
                <p className="text-text-muted mt-1">
                  Supports .md, .txt, and .markdown files
                </p>
              </div>
            </div>
          </div>
        )}

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
    <div
      className="h-dvh flex overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drop zone overlay */}
      {isDragging && (
        <div
          className="absolute inset-0 z-modal bg-bg-primary/90 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="size-20 rounded-full bg-plum/20 flex items-center justify-center">
              <Upload size={40} className="text-plum" />
            </div>
            <div>
              <p className="text-xl font-semibold text-text-invert">
                Drop your file here
              </p>
              <p className="text-text-muted mt-1">
                Supports .md, .txt, and .markdown files
              </p>
            </div>
          </div>
        </div>
      )}

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
  return <EditorContent />;
}
