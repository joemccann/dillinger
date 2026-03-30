// @vitest-environment node

import { describe, expect, it } from "vitest";
import { POST as importHtml } from "@/app/api/import/html-to-markdown/route";

describe("POST /api/import/html-to-markdown", () => {
  it("converts HTML to markdown", async () => {
    const response = await importHtml(
      new Request("http://localhost/api/import/html-to-markdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: "<h1>Hello</h1><p>World</p>",
        }),
      }) as never
    );

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.markdown).toContain("# Hello");
    expect(json.markdown).toContain("World");
  });
});
