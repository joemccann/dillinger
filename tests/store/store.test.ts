import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as Monaco from "monaco-editor";
import { useStore } from "@/stores/store";
import { DEFAULT_DOCUMENT_BODY, DEFAULT_SETTINGS } from "@/lib/types";
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

function createTestDocument(overrides: Partial<{
  id: string;
  title: string;
  body: string;
  createdAt: string;
}> = {}) {
  return {
    id: overrides.id ?? "doc-1",
    title: overrides.title ?? "Test.md",
    body: overrides.body ?? "# Test",
    createdAt: overrides.createdAt ?? "2026-03-10T00:00:00.000Z",
  };
}

function seedStoreWithDocuments(docs: ReturnType<typeof createTestDocument>[], currentIndex = 0) {
  useStore.setState(
    {
      ...useStore.getState(),
      documents: docs,
      currentDocument: docs[currentIndex] ?? null,
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

  describe("createDocument", () => {
    it("creates a new document and sets it as current", () => {
      const existing = createTestDocument({ id: "existing-1" });
      seedStoreWithDocuments([existing]);

      useStore.getState().createDocument();

      const state = useStore.getState();

      expect(state.documents).toHaveLength(2);
      expect(state.currentDocument?.title).toBe(DEFAULT_DOCUMENT_TITLE);
      expect(state.currentDocument?.body).toBe(DEFAULT_DOCUMENT_BODY);
      expect(state.currentDocument?.id).not.toBe("existing-1");
    });

    it("creates a document when no documents exist", () => {
      useStore.getState().createDocument();

      const state = useStore.getState();

      expect(state.documents).toHaveLength(1);
      expect(state.currentDocument).toBe(state.documents[0]);
    });
  });

  describe("selectDocument", () => {
    it("selects an existing document by id", () => {
      const docA = createTestDocument({ id: "a", title: "A.md" });
      const docB = createTestDocument({ id: "b", title: "B.md" });
      seedStoreWithDocuments([docA, docB], 0);

      expect(useStore.getState().currentDocument?.id).toBe("a");

      useStore.getState().selectDocument("b");

      expect(useStore.getState().currentDocument?.id).toBe("b");
      expect(useStore.getState().currentDocument?.title).toBe("B.md");
    });

    it("does nothing when selecting an invalid id", () => {
      const doc = createTestDocument({ id: "valid" });
      seedStoreWithDocuments([doc]);

      useStore.getState().selectDocument("nonexistent");

      expect(useStore.getState().currentDocument?.id).toBe("valid");
    });
  });

  describe("updateDocumentTitle", () => {
    it("updates the title of the current document", () => {
      const doc = createTestDocument({ id: "doc-1", title: "Old.md" });
      seedStoreWithDocuments([doc]);

      useStore.getState().updateDocumentTitle("Renamed.md");

      const state = useStore.getState();

      expect(state.currentDocument?.title).toBe("Renamed.md");
      expect(state.documents[0]?.title).toBe("Renamed.md");
    });

    it("does nothing when there is no current document", () => {
      useStore.setState({ ...useStore.getState(), currentDocument: null }, true);

      useStore.getState().updateDocumentTitle("should not crash");

      expect(useStore.getState().documents).toHaveLength(0);
    });
  });

  describe("updateSettings", () => {
    it("merges partial settings into existing settings", () => {
      useStore.getState().updateSettings({ tabSize: 2 });

      const state = useStore.getState();

      expect(state.settings.tabSize).toBe(2);
      expect(state.settings.enableAutoSave).toBe(DEFAULT_SETTINGS.enableAutoSave);
      expect(state.settings.keybindings).toBe(DEFAULT_SETTINGS.keybindings);
    });

    it("can update multiple settings at once", () => {
      useStore.getState().updateSettings({
        keybindings: "vim",
        enableNightMode: true,
        enableScrollSync: false,
      });

      const state = useStore.getState();

      expect(state.settings.keybindings).toBe("vim");
      expect(state.settings.enableNightMode).toBe(true);
      expect(state.settings.enableScrollSync).toBe(false);
    });
  });

  describe("toggleSidebar", () => {
    it("toggles sidebarOpen from true to false", () => {
      useStore.setState({ ...useStore.getState(), sidebarOpen: true }, true);

      useStore.getState().toggleSidebar();

      expect(useStore.getState().sidebarOpen).toBe(false);
    });

    it("toggles sidebarOpen from false to true", () => {
      useStore.setState({ ...useStore.getState(), sidebarOpen: false }, true);

      useStore.getState().toggleSidebar();

      expect(useStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe("toggleSettings", () => {
    it("toggles settingsOpen from false to true", () => {
      expect(useStore.getState().settingsOpen).toBe(false);

      useStore.getState().toggleSettings();

      expect(useStore.getState().settingsOpen).toBe(true);
    });

    it("toggles settingsOpen from true to false", () => {
      useStore.setState({ ...useStore.getState(), settingsOpen: true }, true);

      useStore.getState().toggleSettings();

      expect(useStore.getState().settingsOpen).toBe(false);
    });
  });

  describe("togglePreview", () => {
    it("toggles previewVisible from true to false", () => {
      expect(useStore.getState().previewVisible).toBe(true);

      useStore.getState().togglePreview();

      expect(useStore.getState().previewVisible).toBe(false);
    });

    it("toggles previewVisible from false to true", () => {
      useStore.setState({ ...useStore.getState(), previewVisible: false }, true);

      useStore.getState().togglePreview();

      expect(useStore.getState().previewVisible).toBe(true);
    });
  });

  describe("setZenMode", () => {
    it("sets zenMode to true", () => {
      useStore.getState().setZenMode(true);

      expect(useStore.getState().zenMode).toBe(true);
    });

    it("sets zenMode to false", () => {
      useStore.setState({ ...useStore.getState(), zenMode: true }, true);

      useStore.getState().setZenMode(false);

      expect(useStore.getState().zenMode).toBe(false);
    });
  });

  describe("setEditorScrollPercent", () => {
    it("sets the scroll percent value", () => {
      useStore.getState().setEditorScrollPercent(0.75);

      expect(useStore.getState().editorScrollPercent).toBe(0.75);
    });
  });

  describe("setEditorTopLine", () => {
    it("sets the top line value", () => {
      useStore.getState().setEditorTopLine(42);

      expect(useStore.getState().editorTopLine).toBe(42);
    });
  });

  describe("hydrate", () => {
    it("restores documents from localStorage", () => {
      const doc = createTestDocument({ id: "stored-1", title: "Stored.md" });
      localStorage.setItem("files", JSON.stringify([doc]));
      localStorage.setItem("currentDocument", JSON.stringify(doc));

      useStore.getState().hydrate();

      const state = useStore.getState();

      expect(state.documents).toHaveLength(1);
      expect(state.documents[0]?.id).toBe("stored-1");
      expect(state.currentDocument?.id).toBe("stored-1");
    });

    it("creates a default document when localStorage has an empty array", () => {
      localStorage.setItem("files", JSON.stringify([]));

      useStore.getState().hydrate();

      const state = useStore.getState();

      expect(state.documents).toHaveLength(1);
      expect(state.currentDocument?.title).toBe(DEFAULT_DOCUMENT_TITLE);
    });

    it("resets currentDocument to first document when stored current is invalid", () => {
      const docA = createTestDocument({ id: "a", title: "A.md" });
      const docB = createTestDocument({ id: "b", title: "B.md" });
      const stale = createTestDocument({ id: "deleted", title: "Gone.md" });

      localStorage.setItem("files", JSON.stringify([docA, docB]));
      localStorage.setItem("currentDocument", JSON.stringify(stale));

      useStore.getState().hydrate();

      const state = useStore.getState();

      expect(state.currentDocument?.id).toBe("a");
    });

    it("restores settings merged with defaults from localStorage", () => {
      const doc = createTestDocument();
      localStorage.setItem("files", JSON.stringify([doc]));
      localStorage.setItem("currentDocument", JSON.stringify(doc));
      localStorage.setItem("profileV3", JSON.stringify({ tabSize: 2, keybindings: "vim" }));

      useStore.getState().hydrate();

      const state = useStore.getState();

      expect(state.settings.tabSize).toBe(2);
      expect(state.settings.keybindings).toBe("vim");
      expect(state.settings.enableAutoSave).toBe(DEFAULT_SETTINGS.enableAutoSave);
    });

    it("uses default settings when profileV3 is missing from localStorage", () => {
      const doc = createTestDocument();
      localStorage.setItem("files", JSON.stringify([doc]));
      localStorage.setItem("currentDocument", JSON.stringify(doc));

      useStore.getState().hydrate();

      expect(useStore.getState().settings).toEqual(DEFAULT_SETTINGS);
    });

    it("sets currentDocument to first document when currentDocument is null in storage", () => {
      const doc = createTestDocument({ id: "first" });
      localStorage.setItem("files", JSON.stringify([doc]));

      useStore.getState().hydrate();

      expect(useStore.getState().currentDocument?.id).toBe("first");
    });

    it("handles corrupted JSON in localStorage gracefully", () => {
      localStorage.setItem("files", "not valid json{{{");
      localStorage.setItem("currentDocument", "also broken");

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      useStore.getState().hydrate();

      expect(consoleSpy).toHaveBeenCalledWith("Failed to hydrate state:", expect.any(SyntaxError));

      // State should remain unchanged (no crash)
      const state = useStore.getState();
      expect(state.documents).toEqual([]);
      expect(state.currentDocument).toBeNull();

      consoleSpy.mockRestore();
    });

    it("merges partial settings with defaults when stored settings have missing keys", () => {
      const doc = createTestDocument();
      localStorage.setItem("files", JSON.stringify([doc]));
      localStorage.setItem("currentDocument", JSON.stringify(doc));
      // Store only one key - all others should come from defaults
      localStorage.setItem("profileV3", JSON.stringify({ enableNightMode: true }));

      useStore.getState().hydrate();

      const { settings } = useStore.getState();

      expect(settings.enableNightMode).toBe(true);
      expect(settings.tabSize).toBe(DEFAULT_SETTINGS.tabSize);
      expect(settings.keybindings).toBe(DEFAULT_SETTINGS.keybindings);
      expect(settings.enableAutoSave).toBe(DEFAULT_SETTINGS.enableAutoSave);
      expect(settings.enableScrollSync).toBe(DEFAULT_SETTINGS.enableScrollSync);
    });
  });

  describe("insertMarkdownAtCursor", () => {
    it("appends markdown to body when no editor instance is set", () => {
      const doc = createTestDocument({ id: "doc-1", body: "existing content" });
      seedStoreWithDocuments([doc]);

      useStore.getState().insertMarkdownAtCursor("\n**appended**");

      const state = useStore.getState();

      expect(state.currentDocument?.body).toBe("existing content\n**appended**");
      expect(state.documents[0]?.body).toBe("existing content\n**appended**");
    });

    it("does nothing when no editor instance and no current document", () => {
      useStore.setState({ ...useStore.getState(), editorInstance: null, currentDocument: null }, true);

      useStore.getState().insertMarkdownAtCursor("**bold**");

      expect(useStore.getState().currentDocument).toBeNull();
    });

    it("falls back to appending when editor has no selection", () => {
      const doc = createTestDocument({ id: "doc-1", body: "hello" });
      const editor = {
        getSelection: vi.fn(() => null),
        executeEdits: vi.fn(),
        focus: vi.fn(),
      } as unknown as Monaco.editor.IStandaloneCodeEditor;

      useStore.setState(
        {
          ...useStore.getState(),
          documents: [doc],
          currentDocument: doc,
          editorInstance: editor,
        },
        true
      );

      useStore.getState().insertMarkdownAtCursor("**bold**");

      expect(editor.executeEdits).not.toHaveBeenCalled();
      expect(useStore.getState().currentDocument?.body).toBe("hello**bold**");
    });
  });

  describe("persist", () => {
    it("writes documents, currentDocument, and settings to localStorage", () => {
      const doc = createTestDocument({ id: "persist-1", title: "Persisted.md" });
      seedStoreWithDocuments([doc]);
      useStore.getState().updateSettings({ tabSize: 8 });

      useStore.getState().persist();

      const storedFiles = JSON.parse(localStorage.getItem("files")!);
      const storedCurrent = JSON.parse(localStorage.getItem("currentDocument")!);
      const storedSettings = JSON.parse(localStorage.getItem("profileV3")!);

      expect(storedFiles).toHaveLength(1);
      expect(storedFiles[0].id).toBe("persist-1");
      expect(storedCurrent.title).toBe("Persisted.md");
      expect(storedSettings.tabSize).toBe(8);
    });

    it("stores null currentDocument when none is selected", () => {
      useStore.setState({ ...useStore.getState(), currentDocument: null }, true);

      useStore.getState().persist();

      const storedCurrent = JSON.parse(localStorage.getItem("currentDocument")!);

      expect(storedCurrent).toBeNull();
    });

    it("persists empty documents array", () => {
      useStore.setState({ ...useStore.getState(), documents: [], currentDocument: null }, true);

      useStore.getState().persist();

      const storedFiles = JSON.parse(localStorage.getItem("files")!);

      expect(storedFiles).toEqual([]);
    });

    it("handles localStorage write failure gracefully", () => {
      const doc = createTestDocument({ id: "persist-fail" });
      seedStoreWithDocuments([doc]);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const originalSetItem = localStorage.setItem.bind(localStorage);
      localStorage.setItem = () => {
        throw new Error("QuotaExceededError");
      };

      useStore.getState().persist();

      expect(consoleSpy).toHaveBeenCalledWith("Failed to persist state:", expect.any(Error));

      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("deleteDocument", () => {
    it("removes a document from the list", () => {
      const docA = createTestDocument({ id: "a" });
      const docB = createTestDocument({ id: "b" });
      seedStoreWithDocuments([docA, docB], 0);

      useStore.getState().deleteDocument("b");

      const state = useStore.getState();

      expect(state.documents).toHaveLength(1);
      expect(state.documents[0]?.id).toBe("a");
      expect(state.currentDocument?.id).toBe("a");
    });

    it("selects another document when the current one is deleted", () => {
      const docA = createTestDocument({ id: "a", title: "A.md" });
      const docB = createTestDocument({ id: "b", title: "B.md" });
      seedStoreWithDocuments([docA, docB], 0);

      useStore.getState().deleteDocument("a");

      const state = useStore.getState();

      expect(state.documents).toHaveLength(1);
      expect(state.currentDocument?.id).toBe("b");
    });

    it("sets currentDocument to null when the last document is deleted", () => {
      const doc = createTestDocument({ id: "only" });
      seedStoreWithDocuments([doc]);

      useStore.getState().deleteDocument("only");

      const state = useStore.getState();

      expect(state.documents).toHaveLength(0);
      expect(state.currentDocument).toBeNull();
    });

    it("does not change current document when a non-current document is deleted", () => {
      const docA = createTestDocument({ id: "a" });
      const docB = createTestDocument({ id: "b" });
      seedStoreWithDocuments([docA, docB], 0);

      useStore.getState().deleteDocument("b");

      expect(useStore.getState().currentDocument?.id).toBe("a");
    });

    it("handles deleting a nonexistent document id without error", () => {
      const doc = createTestDocument({ id: "existing" });
      seedStoreWithDocuments([doc]);

      useStore.getState().deleteDocument("nonexistent");

      const state = useStore.getState();

      expect(state.documents).toHaveLength(1);
      expect(state.documents[0]?.id).toBe("existing");
      expect(state.currentDocument?.id).toBe("existing");
    });
  });

  describe("updateDocumentBody", () => {
    it("updates the body of the current document", () => {
      const doc = createTestDocument({ id: "doc-1", body: "old body" });
      seedStoreWithDocuments([doc]);

      useStore.getState().updateDocumentBody("new body");

      const state = useStore.getState();

      expect(state.currentDocument?.body).toBe("new body");
      expect(state.documents[0]?.body).toBe("new body");
    });

    it("does nothing when there is no current document", () => {
      useStore.setState({ ...useStore.getState(), currentDocument: null }, true);

      useStore.getState().updateDocumentBody("should not crash");

      expect(useStore.getState().documents).toHaveLength(0);
    });

    it("only updates the matching document in a multi-document list", () => {
      const docA = createTestDocument({ id: "a", body: "body-a" });
      const docB = createTestDocument({ id: "b", body: "body-b" });
      seedStoreWithDocuments([docA, docB], 0);

      useStore.getState().updateDocumentBody("updated-a");

      const state = useStore.getState();

      expect(state.documents.find((d) => d.id === "a")?.body).toBe("updated-a");
      expect(state.documents.find((d) => d.id === "b")?.body).toBe("body-b");
    });

    it("leaves non-matching documents unchanged when currentDocument id has no match", () => {
      const docA = createTestDocument({ id: "a", body: "body-a" });
      const orphanCurrent = createTestDocument({ id: "orphan", body: "orphan-body" });
      useStore.setState(
        {
          ...useStore.getState(),
          documents: [docA],
          currentDocument: orphanCurrent,
        },
        true
      );

      useStore.getState().updateDocumentBody("new-orphan-body");

      const state = useStore.getState();

      // The currentDocument gets updated
      expect(state.currentDocument?.body).toBe("new-orphan-body");
      // docA remains unchanged since its id doesn't match
      expect(state.documents.find((d) => d.id === "a")?.body).toBe("body-a");
    });
  });

  describe("setEditorInstance", () => {
    it("sets the editor instance", () => {
      const editor = { getSelection: vi.fn() } as unknown as Monaco.editor.IStandaloneCodeEditor;

      useStore.getState().setEditorInstance(editor);

      expect(useStore.getState().editorInstance).toBe(editor);
    });

    it("clears the editor instance when set to null", () => {
      const editor = { getSelection: vi.fn() } as unknown as Monaco.editor.IStandaloneCodeEditor;
      useStore.getState().setEditorInstance(editor);

      useStore.getState().setEditorInstance(null);

      expect(useStore.getState().editorInstance).toBeNull();
    });
  });
});
