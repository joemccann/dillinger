import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentTitle } from "@/components/editor/DocumentTitle";
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
    title: "My Document.md",
    body: "# Hello",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function seedDocument(doc: Document = createDocument()) {
  useStore.setState({
    documents: [doc],
    currentDocument: doc,
  });
  return doc;
}

describe("DocumentTitle", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders the current document title", () => {
    seedDocument();
    render(<DocumentTitle />);

    expect(screen.getByText("My Document.md")).toBeVisible();
  });

  it("renders nothing when there is no current document", () => {
    const { container } = render(<DocumentTitle />);
    expect(container.innerHTML).toBe("");
  });

  it("shows the default placeholder when the document title is empty", () => {
    seedDocument(createDocument({ title: "" }));
    render(<DocumentTitle />);

    expect(screen.getByText("Untitled Document.md")).toBeVisible();
  });

  it("enters edit mode when the edit button is clicked", async () => {
    const user = userEvent.setup();
    seedDocument();
    render(<DocumentTitle />);

    await user.click(screen.getByRole("button", { name: "Edit title" }));

    expect(screen.getByLabelText("Document title")).toBeVisible();
  });

  it("saves a new title when Enter is pressed", async () => {
    const user = userEvent.setup();
    seedDocument();
    render(<DocumentTitle />);

    await user.click(screen.getByRole("button", { name: "Edit title" }));

    const input = screen.getByLabelText("Document title");
    await user.clear(input);
    await user.type(input, "Renamed.md{Enter}");

    expect(useStore.getState().currentDocument?.title).toBe("Renamed.md");
    expect(screen.getByText("Renamed.md")).toBeVisible();
  });

  it("cancels editing and reverts when Escape is pressed", async () => {
    const user = userEvent.setup();
    seedDocument();
    render(<DocumentTitle />);

    await user.click(screen.getByRole("button", { name: "Edit title" }));

    const input = screen.getByLabelText("Document title");
    await user.clear(input);
    await user.type(input, "Temporary Name{Escape}");

    expect(screen.getByText("My Document.md")).toBeVisible();
    expect(useStore.getState().currentDocument?.title).toBe("My Document.md");
  });

  it("saves the title on blur", async () => {
    const user = userEvent.setup();
    seedDocument();
    render(<DocumentTitle />);

    await user.click(screen.getByRole("button", { name: "Edit title" }));

    const input = screen.getByLabelText("Document title");
    await user.clear(input);
    await user.type(input, "Blurred Title.md");
    await user.tab();

    expect(useStore.getState().currentDocument?.title).toBe("Blurred Title.md");
  });

  it("reverts to original title when input is cleared and saved", async () => {
    const user = userEvent.setup();
    seedDocument();
    render(<DocumentTitle />);

    await user.click(screen.getByRole("button", { name: "Edit title" }));

    const input = screen.getByLabelText("Document title");
    await user.clear(input);
    await user.type(input, "{Enter}");

    expect(useStore.getState().currentDocument?.title).toBe("My Document.md");
  });
});
