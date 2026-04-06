import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/components/navbar/Navbar";
import { useStore } from "@/stores/store";

const mockNotify = vi.fn();
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ notify: mockNotify }),
}));

const mockUpload = vi.fn();
vi.mock("@/hooks/useImageUpload", () => ({
  useImageUpload: () => ({ upload: mockUpload, isUploading: false }),
}));

const mockImportDocumentFile = vi.fn();
vi.mock("@/lib/import", () => ({
  importDocumentFile: (...args: unknown[]) => mockImportDocumentFile(...args),
}));

const initialState = useStore.getState();

function resetStore() {
  useStore.setState(
    {
      ...initialState,
      documents: [],
      currentDocument: {
        id: "test-doc-1",
        title: "Test Document",
        body: "# Hello World",
        createdAt: new Date().toISOString(),
      },
      editorInstance: null,
      settings: { ...initialState.settings },
      sidebarOpen: false,
      settingsOpen: false,
      previewVisible: true,
      zenMode: false,
      editorScrollPercent: 0,
      editorTopLine: 1,
    },
    true
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders menu icon, logo, and action buttons", () => {
    render(<Navbar />);

    expect(screen.getByRole("button", { name: "Toggle sidebar" })).toBeInTheDocument();
    expect(screen.getByText("DILLINGER")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export document" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open settings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enter zen mode" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import file" })).toBeInTheDocument();
  });

  it("calls toggleSidebar when menu button is clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    expect(useStore.getState().sidebarOpen).toBe(false);

    await user.click(screen.getByRole("button", { name: "Toggle sidebar" }));

    expect(useStore.getState().sidebarOpen).toBe(true);
  });

  it("toggles preview visibility and reflects state in aria-pressed", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const previewButton = screen.getByRole("button", { name: "Hide preview" });
    expect(previewButton).toHaveAttribute("aria-pressed", "true");

    await user.click(previewButton);

    expect(useStore.getState().previewVisible).toBe(false);
    const updatedButton = screen.getByRole("button", { name: "Show preview" });
    expect(updatedButton).toHaveAttribute("aria-pressed", "false");
  });

  it("calls toggleSettings when settings button is clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    expect(useStore.getState().settingsOpen).toBe(false);

    await user.click(screen.getByRole("button", { name: "Open settings" }));

    expect(useStore.getState().settingsOpen).toBe(true);
  });

  it("opens export dropdown on click", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    expect(screen.queryByRole("menu", { name: "Export formats" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Export document" }));

    expect(screen.getByRole("menu", { name: "Export formats" })).toBeInTheDocument();
  });

  it("shows all format options in the export dropdown", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Export document" }));

    const items = screen.getAllByRole("menuitem");

    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("Markdown");
    expect(items[1]).toHaveTextContent("HTML");
    expect(items[2]).toHaveTextContent("Styled HTML");
    expect(items[3]).toHaveTextContent("PDF");
  });

  it("renders a hidden file input for document import", () => {
    render(<Navbar />);

    const input = screen.getByTestId("document-import-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute(
      "accept",
      ".md,.markdown,.txt,.html,.htm,text/plain,text/markdown,text/html"
    );
  });

  it("has a zen mode button that sets zen mode", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    expect(useStore.getState().zenMode).toBe(false);

    await user.click(screen.getByRole("button", { name: "Enter zen mode" }));

    expect(useStore.getState().zenMode).toBe(true);
  });

  it("closes export dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Export document" }));
    expect(screen.getByRole("menu", { name: "Export formats" })).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByRole("menu", { name: "Export formats" })).not.toBeInTheDocument();
  });

  it("closes export dropdown when Escape key is pressed", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Export document" }));
    expect(screen.getByRole("menu", { name: "Export formats" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu", { name: "Export formats" })).not.toBeInTheDocument();
  });

  it("clicking Import button triggers the hidden file input", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const fileInput = screen.getByTestId("document-import-input");
    const clickSpy = vi.spyOn(fileInput, "click");

    await user.click(screen.getByRole("button", { name: "Import file" }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it("clicking Image button triggers the hidden image input", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const imageInput = screen.getByTestId("image-import-input");
    const clickSpy = vi.spyOn(imageInput, "click");

    await user.click(screen.getByRole("button", { name: "Insert image" }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it("renders a hidden file input for image import", () => {
    render(<Navbar />);

    const input = screen.getByTestId("image-import-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", "image/*");
  });

  describe("handleExport", () => {
    function mockFetchSuccess(contentType = "application/octet-stream", filename?: string) {
      const blob = new Blob(["content"], { type: contentType });
      const headers = new Headers({ "Content-Type": contentType });
      if (filename) {
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
      }
      const response = new Response(blob, { status: 200, headers });
      vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
      return response;
    }

    function mockFetchFailure() {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    }

    let mockAnchor: { href: string; download: string; click: ReturnType<typeof vi.fn> };
    const originalCreateElement = document.createElement.bind(document);

    beforeEach(() => {
      mockAnchor = { href: "", download: "", click: vi.fn() };
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "a") return mockAnchor as unknown as HTMLElement;
        return originalCreateElement(tag);
      });
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-url");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    });

    it("exports as markdown and triggers download", async () => {
      const user = userEvent.setup();
      mockFetchSuccess("text/markdown");
      render(<Navbar />);

      await user.click(screen.getByRole("button", { name: "Export document" }));
      await user.click(screen.getByRole("menuitem", { name: /^Markdown$/ }));

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/export/markdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            markdown: "# Hello World",
            title: "Test Document",
            styled: undefined,
          }),
        });
      });

      await waitFor(() => {
        expect(mockAnchor.click).toHaveBeenCalled();
      });
      expect(mockAnchor.href).toBe("blob:test-url");
      expect(mockAnchor.download).toBe("Test Document.md");
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-url");
      expect(mockNotify).toHaveBeenCalledWith("Exported as MARKDOWN");
    });

    it("exports as HTML and triggers download", async () => {
      const user = userEvent.setup();
      mockFetchSuccess("text/html");
      render(<Navbar />);

      await user.click(screen.getByRole("button", { name: "Export document" }));
      await user.click(screen.getByRole("menuitem", { name: /^HTML$/ }));

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/export/html", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            markdown: "# Hello World",
            title: "Test Document",
            styled: false,
          }),
        });
      });

      await waitFor(() => {
        expect(mockAnchor.click).toHaveBeenCalled();
      });
      expect(mockAnchor.download).toBe("Test Document.html");
      expect(mockNotify).toHaveBeenCalledWith("Exported as HTML");
    });

    it("exports as styled HTML and shows styled notification", async () => {
      const user = userEvent.setup();
      mockFetchSuccess("text/html");
      render(<Navbar />);

      await user.click(screen.getByRole("button", { name: "Export document" }));
      await user.click(screen.getByRole("menuitem", { name: /Styled HTML/ }));

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/export/html", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            markdown: "# Hello World",
            title: "Test Document",
            styled: true,
          }),
        });
      });

      await waitFor(() => {
        expect(mockNotify).toHaveBeenCalledWith("Exported as styled HTML");
      });
    });

    it("exports as PDF and triggers download", async () => {
      const user = userEvent.setup();
      mockFetchSuccess("application/pdf");
      render(<Navbar />);

      await user.click(screen.getByRole("button", { name: "Export document" }));
      await user.click(screen.getByRole("menuitem", { name: /PDF/ }));

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/export/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            markdown: "# Hello World",
            title: "Test Document",
            styled: undefined,
          }),
        });
      });

      await waitFor(() => {
        expect(mockAnchor.click).toHaveBeenCalled();
      });
      expect(mockAnchor.download).toBe("Test Document.pdf");
      expect(mockNotify).toHaveBeenCalledWith("Exported as PDF");
    });

    it("uses filename from Content-Disposition header when available", async () => {
      const user = userEvent.setup();
      mockFetchSuccess("text/markdown", "custom-name.md");
      render(<Navbar />);

      await user.click(screen.getByRole("button", { name: "Export document" }));
      await user.click(screen.getByRole("menuitem", { name: /^Markdown$/ }));

      await waitFor(() => {
        expect(mockAnchor.download).toBe("custom-name.md");
      });
    });

    it("shows error toast when export fetch fails", async () => {
      const user = userEvent.setup();
      mockFetchFailure();
      render(<Navbar />);

      await user.click(screen.getByRole("button", { name: "Export document" }));
      await user.click(screen.getByRole("menuitem", { name: /^Markdown$/ }));

      await waitFor(() => {
        expect(mockNotify).toHaveBeenCalledWith("MARKDOWN export failed — check your connection");
      });
    });

    it("shows error toast when response is not ok", async () => {
      const user = userEvent.setup();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("error", { status: 500 })
      );
      render(<Navbar />);

      await user.click(screen.getByRole("button", { name: "Export document" }));
      await user.click(screen.getByRole("menuitem", { name: /^Markdown$/ }));

      await waitFor(() => {
        expect(mockNotify).toHaveBeenCalledWith("MARKDOWN export failed — please try again");
      });
    });

    it("does nothing when currentDocument is null", async () => {
      useStore.setState({ currentDocument: null }, false);
      const user = userEvent.setup();
      vi.spyOn(globalThis, "fetch");
      render(<Navbar />);

      await user.click(screen.getByRole("button", { name: "Export document" }));
      await user.click(screen.getByRole("menuitem", { name: /^Markdown$/ }));

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("closes the dropdown after clicking an export option", async () => {
      const user = userEvent.setup();
      mockFetchSuccess();
      render(<Navbar />);

      await user.click(screen.getByRole("button", { name: "Export document" }));
      expect(screen.getByRole("menu", { name: "Export formats" })).toBeInTheDocument();

      await user.click(screen.getByRole("menuitem", { name: /^Markdown$/ }));

      expect(screen.queryByRole("menu", { name: "Export formats" })).not.toBeInTheDocument();
    });
  });

  describe("handleImportSelection", () => {
    it("imports a markdown file and creates a document", async () => {
      mockImportDocumentFile.mockResolvedValue({
        body: "# Imported Content",
        title: "imported",
      });

      render(<Navbar />);

      const input = screen.getByTestId("document-import-input");
      const file = new File(["# Imported Content"], "imported.md", { type: "text/markdown" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockImportDocumentFile).toHaveBeenCalledWith(file);
      });

      await waitFor(() => {
        expect(mockNotify).toHaveBeenCalledWith('Imported "imported.md"');
      });
    });

    it("shows error toast when import fails with Error", async () => {
      mockImportDocumentFile.mockRejectedValue(new Error("Unsupported file type"));

      render(<Navbar />);

      const input = screen.getByTestId("document-import-input");
      const file = new File(["stuff"], "bad.xyz", { type: "application/octet-stream" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockNotify).toHaveBeenCalledWith("Unsupported file type");
      });
    });

    it("shows generic error toast when import fails with non-Error", async () => {
      mockImportDocumentFile.mockRejectedValue("unknown error");

      render(<Navbar />);

      const input = screen.getByTestId("document-import-input");
      const file = new File(["stuff"], "bad.xyz", { type: "application/octet-stream" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockNotify).toHaveBeenCalledWith("Failed to import file");
      });
    });

    it("does nothing when no file is selected", () => {
      render(<Navbar />);

      const input = screen.getByTestId("document-import-input");

      fireEvent.change(input, { target: { files: [] } });

      expect(mockImportDocumentFile).not.toHaveBeenCalled();
      expect(mockNotify).not.toHaveBeenCalled();
    });

    it("resets input value after file selection", async () => {
      mockImportDocumentFile.mockResolvedValue({
        body: "content",
        title: "test",
      });

      render(<Navbar />);

      const input = screen.getByTestId("document-import-input") as HTMLInputElement;
      const file = new File(["content"], "test.md", { type: "text/markdown" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockImportDocumentFile).toHaveBeenCalled();
      });

      expect(input.value).toBe("");
    });
  });

  describe("handleImageSelection", () => {
    it("uploads an image and inserts markdown at cursor", async () => {
      const insertMarkdownAtCursor = vi.fn();
      useStore.setState({ insertMarkdownAtCursor }, false);

      mockUpload.mockResolvedValue({
        url: "https://example.com/image.png",
        markdown: "![image](https://example.com/image.png)",
        filename: "image.png",
        size: 1024,
        type: "image/png",
      });

      render(<Navbar />);

      const input = screen.getByTestId("image-import-input");
      const file = new File(["png-data"], "image.png", { type: "image/png" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(file);
      });

      await waitFor(() => {
        expect(insertMarkdownAtCursor).toHaveBeenCalledWith(
          "\n![image](https://example.com/image.png)\n"
        );
      });
    });

    it("does nothing when upload returns null", async () => {
      const insertMarkdownAtCursor = vi.fn();
      useStore.setState({ insertMarkdownAtCursor }, false);

      mockUpload.mockResolvedValue(null);

      render(<Navbar />);

      const input = screen.getByTestId("image-import-input");
      const file = new File(["png-data"], "image.png", { type: "image/png" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(file);
      });

      expect(insertMarkdownAtCursor).not.toHaveBeenCalled();
    });

    it("does nothing when no file is selected", () => {
      render(<Navbar />);

      const input = screen.getByTestId("image-import-input");

      fireEvent.change(input, { target: { files: [] } });

      expect(mockUpload).not.toHaveBeenCalled();
    });

    it("resets input value after image selection", async () => {
      mockUpload.mockResolvedValue(null);

      render(<Navbar />);

      const input = screen.getByTestId("image-import-input") as HTMLInputElement;
      const file = new File(["png-data"], "image.png", { type: "image/png" });

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled();
      });

      expect(input.value).toBe("");
    });
  });
});
