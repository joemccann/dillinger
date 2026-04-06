import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentList } from "@/components/sidebar/DocumentList";
import { useStore } from "@/stores/store";
import { Document } from "@/lib/types";

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

function createDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: "doc-1",
    title: "First Document.md",
    body: "# Hello",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("DocumentList", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders a list of documents", () => {
    const docs = [
      createDocument({ id: "1", title: "Alpha.md" }),
      createDocument({ id: "2", title: "Beta.md" }),
      createDocument({ id: "3", title: "Gamma.md" }),
    ];

    useStore.setState({ documents: docs, currentDocument: docs[0] });
    render(<DocumentList />);

    expect(screen.getByText("Alpha.md")).toBeVisible();
    expect(screen.getByText("Beta.md")).toBeVisible();
    expect(screen.getByText("Gamma.md")).toBeVisible();
  });

  it("shows document titles as button text", () => {
    const docs = [createDocument({ id: "1", title: "README.md" })];
    useStore.setState({ documents: docs, currentDocument: docs[0] });
    render(<DocumentList />);

    const button = screen.getByRole("button", { name: /README\.md/ });
    expect(button).toBeVisible();
  });

  it("highlights the currently selected document", () => {
    const docs = [
      createDocument({ id: "1", title: "Selected.md" }),
      createDocument({ id: "2", title: "Other.md" }),
    ];

    useStore.setState({ documents: docs, currentDocument: docs[0] });
    render(<DocumentList />);

    const selectedButton = screen.getByRole("button", { name: /Selected\.md/ });
    const otherButton = screen.getByRole("button", { name: /Other\.md/ });

    expect(selectedButton.className).toContain("bg-bg-highlight");
    expect(selectedButton.className).toContain("text-text-invert");
    expect(otherButton.className).not.toContain("text-text-invert");
  });

  it("selects a document when clicked", async () => {
    const user = userEvent.setup();

    const docs = [
      createDocument({ id: "1", title: "First.md" }),
      createDocument({ id: "2", title: "Second.md" }),
    ];

    useStore.setState({ documents: docs, currentDocument: docs[0] });
    render(<DocumentList />);

    await user.click(screen.getByRole("button", { name: /Second\.md/ }));

    expect(useStore.getState().currentDocument?.id).toBe("2");
  });

  it("renders an empty list when there are no documents", () => {
    render(<DocumentList />);

    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });
});
