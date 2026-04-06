import { describe, it, expect, vi, beforeEach } from "vitest";
import { importDocumentFile } from "@/lib/import";

describe("importDocumentFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("imports a .md file with body and stripped title", async () => {
    const file = new File(["# Hello World"], "notes.md", {
      type: "text/markdown",
    });

    const result = await importDocumentFile(file);

    expect(result).toEqual({
      body: "# Hello World",
      title: "notes",
    });
  });

  it("imports a .markdown file with body and stripped title", async () => {
    const file = new File(["some content"], "readme.markdown", {
      type: "text/markdown",
    });

    const result = await importDocumentFile(file);

    expect(result).toEqual({
      body: "some content",
      title: "readme",
    });
  });

  it("imports a .txt file as markdown", async () => {
    const file = new File(["plain text content"], "draft.txt", {
      type: "text/plain",
    });

    const result = await importDocumentFile(file);

    expect(result).toEqual({
      body: "plain text content",
      title: "draft",
    });
  });

  it("imports a .html file by converting to markdown via API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ markdown: "# converted" }),
      }),
    );

    const file = new File(["<h1>Hello</h1>"], "page.html", {
      type: "text/html",
    });

    const result = await importDocumentFile(file);

    expect(result).toEqual({
      body: "# converted",
      title: "page",
    });
  });

  it("imports a .htm file by converting to markdown via API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ markdown: "# from htm" }),
      }),
    );

    const file = new File(["<p>content</p>"], "legacy.htm", {
      type: "text/html",
    });

    const result = await importDocumentFile(file);

    expect(result).toEqual({
      body: "# from htm",
      title: "legacy",
    });
  });

  it("calls the correct API endpoint for HTML conversion", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ markdown: "# result" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const file = new File(["<h1>Test</h1>"], "test.html", {
      type: "text/html",
    });

    await importDocumentFile(file);

    expect(mockFetch).toHaveBeenCalledWith("/api/import/html-to-markdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: "<h1>Test</h1>" }),
    });
  });

  it("throws an error when the HTML conversion API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "conversion failed" }),
      }),
    );

    const file = new File(["<h1>Bad</h1>"], "bad.html", {
      type: "text/html",
    });

    await expect(importDocumentFile(file)).rejects.toThrow(
      "conversion failed",
    );
  });

  it("throws an error for unknown file types", async () => {
    const file = new File(["data"], "image.png", { type: "image/png" });

    await expect(importDocumentFile(file)).rejects.toThrow(
      "Please choose a .md, .txt, .markdown, .html, or .htm file",
    );
  });
});
