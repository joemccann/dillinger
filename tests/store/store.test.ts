import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as Monaco from "monaco-editor";
import { useStore } from "@/stores/store";
import { DEFAULT_DOCUMENT_BODY } from "@/lib/types";
import { DEFAULT_DOCUMENT_TITLE } from "@/lib/document";

const initialState = useStore.getState();

function resetStore() {
  useStore.setState(
    {
      ...initialState,
      documents: [],
      currentDocument: null,
      editorInstance: null,
      settings: { ...initialState.settings },
      sidebarOpen: true,
      settingsOpen: false,
      previewVisible: true,
      zenMode: false,
      editorScrollPercent: 0,
      editorTopLine: 1,
    },
    true
  );
}

describe("useStore", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it("hydrates a default document when storage is empty", () => {
    useStore.getState().hydrate();

    const state = useStore.getState();

    expect(state.documents).toHaveLength(1);
    expect(state.currentDocument?.title).toBe(DEFAULT_DOCUMENT_TITLE);
    expect(state.currentDocument?.body).toBe(DEFAULT_DOCUMENT_BODY);
  });

  it("creates a new imported document without overwriting the current one", () => {
    useStore.getState().hydrate();

    const originalId = useStore.getState().currentDocument?.id;

    useStore.getState().createImportedDocument("Imported.html", "# Imported");

    const state = useStore.getState();

    expect(state.documents).toHaveLength(2);
    expect(state.currentDocument?.title).toBe("Imported.html");
    expect(state.currentDocument?.body).toBe("# Imported");
    expect(state.documents[0]?.id).toBe(originalId);
  });

  it("inserts markdown through the Monaco editor when a selection exists", () => {
    const document = {
      id: "doc-1",
      title: "Test.md",
      body: "hello",
      createdAt: "2026-03-10T00:00:00.000Z",
    };
    const selection = {
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    };
    const executeEdits = vi.fn();
    const focus = vi.fn();
    const editor = {
      getSelection: vi.fn(() => selection),
      executeEdits,
      focus,
    } as unknown as Monaco.editor.IStandaloneCodeEditor;

    useStore.setState(
      {
        ...useStore.getState(),
        documents: [document],
        currentDocument: document,
        editorInstance: editor,
      },
      true
    );

    useStore.getState().insertMarkdownAtCursor("**bold**");

    expect(executeEdits).toHaveBeenCalledWith("dillinger-inline-insert", [
      {
        range: selection,
        text: "**bold**",
        forceMoveMarkers: true,
      },
    ]);
    expect(focus).toHaveBeenCalledOnce();
    expect(useStore.getState().currentDocument?.body).toBe("hello");
  });
});
