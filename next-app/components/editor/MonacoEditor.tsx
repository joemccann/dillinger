"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { useStore } from "@/stores/store";

export function MonacoEditor() {
  const editorRef = useRef<unknown>(null);
  const currentDocument = useStore((state) => state.currentDocument);
  const settings = useStore((state) => state.settings);
  const updateDocumentBody = useStore((state) => state.updateDocumentBody);
  const persist = useStore((state) => state.persist);

  // Debounced persist for auto-save
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleChange: OnChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return;

      updateDocumentBody(value);

      // Debounced auto-save
      if (settings.enableAutoSave) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          persist();
        }, 2000);
      }
    },
    [updateDocumentBody, persist, settings.enableAutoSave]
  );

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-primary text-text-muted">
        No document selected
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language="markdown"
      theme={settings.enableNightMode ? "vs-dark" : "vs"}
      value={currentDocument.body}
      onChange={handleChange}
      onMount={handleMount}
      options={{
        fontSize: 14,
        fontFamily: '"Ubuntu Mono", Monaco, monospace',
        lineHeight: 24,
        wordWrap: "on",
        minimap: { enabled: false },
        lineNumbers: "off",
        folding: false,
        tabSize: settings.tabSize,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: "none",
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
        },
      }}
    />
  );
}
