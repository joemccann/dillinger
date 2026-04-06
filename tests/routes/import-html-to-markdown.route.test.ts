// @vitest-environment node

import { describe, expect, it } from "vitest";
import { POST as importHtml } from "@/app/api/import/html-to-markdown/route";

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/import/html-to-markdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

describe("POST /api/import/html-to-markdown", () => {
  it("converts HTML to markdown", async () => {
    const response = await importHtml(
      buildRequest({ html: "<h1>Hello</h1><p>World</p>" })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.markdown).toContain("# Hello");
    expect(json.markdown).toContain("World");
  });

  it("returns 400 when html field is missing", async () => {
    const response = await importHtml(buildRequest({}));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("HTML content is required");
  });

  it("returns 400 when html is not a string", async () => {
    const response = await importHtml(buildRequest({ html: 42 }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("HTML content is required");
  });

  it("returns 400 when html is an empty string", async () => {
    const response = await importHtml(buildRequest({ html: "" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("HTML content is required");
  });

  it("returns 400 when html is whitespace only", async () => {
    const response = await importHtml(buildRequest({ html: "   " }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("HTML content is required");
  });

  it("converts strikethrough tags to markdown", async () => {
    const response = await importHtml(
      buildRequest({ html: "<p><del>removed</del></p>" })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.markdown).toContain("~~removed~~");
  });

  it("converts complex HTML with lists and links", async () => {
    const response = await importHtml(
      buildRequest({
        html: '<ul><li>Item 1</li><li>Item 2</li></ul><a href="https://example.com">link</a>',
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.markdown).toContain("-   Item 1");
    expect(json.markdown).toContain("[link](https://example.com)");
  });

  it("returns 500 when request body is invalid JSON", async () => {
    const response = await importHtml(
      new Request("http://localhost/api/import/html-to-markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      }) as never
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe("Failed to convert HTML to Markdown");
  });
});
