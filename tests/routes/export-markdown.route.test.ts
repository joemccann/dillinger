// @vitest-environment node

import { describe, expect, it } from "vitest";
import { POST as exportMarkdown } from "@/app/api/export/markdown/route";

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/export/markdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

describe("POST /api/export/markdown", () => {
  it("returns markdown content with a clean filename", async () => {
    const response = await exportMarkdown(
      buildRequest({ markdown: "# Hello", title: "Draft.md" })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain(
      'filename="Draft.md"'
    );
    expect(await response.text()).toBe("# Hello");
  });

  it("returns 400 when markdown body is missing", async () => {
    const response = await exportMarkdown(buildRequest({ title: "no-body.md" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Markdown content is required");
  });

  it("returns 400 when markdown is empty string", async () => {
    const response = await exportMarkdown(
      buildRequest({ markdown: "", title: "empty.md" })
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Markdown content is required");
  });

  it("uses custom filename from title in Content-Disposition", async () => {
    const response = await exportMarkdown(
      buildRequest({ markdown: "content", title: "My Notes.md" })
    );

    expect(response.status).toBe(200);
    const disposition = response.headers.get("Content-Disposition");
    expect(disposition).toContain('filename="My_Notes.md"');
  });

  it("sets correct content-type header", async () => {
    const response = await exportMarkdown(
      buildRequest({ markdown: "# Test", title: "test.md" })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8"
    );
  });

  it("generates a default filename when title is omitted", async () => {
    const response = await exportMarkdown(
      buildRequest({ markdown: "# No title" })
    );

    expect(response.status).toBe(200);
    const disposition = response.headers.get("Content-Disposition");
    expect(disposition).toContain("attachment");
    expect(disposition).toContain(".md");
  });

  it("replaces file extension in title with .md", async () => {
    const response = await exportMarkdown(
      buildRequest({ markdown: "content", title: "readme.txt" })
    );

    expect(response.status).toBe(200);
    const disposition = response.headers.get("Content-Disposition");
    expect(disposition).toContain(".md");
  });

  it("returns 500 when request body is invalid JSON", async () => {
    const response = await exportMarkdown(
      new Request("http://localhost/api/export/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      }) as never
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe("Failed to export markdown");
  });
});
