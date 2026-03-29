// @vitest-environment node

import { describe, expect, it } from "vitest";
import { POST as exportMarkdown } from "@/app/api/export/markdown/route";

describe("POST /api/export/markdown", () => {
  it("returns markdown content with a clean filename", async () => {
    const response = await exportMarkdown(
      new Request("http://localhost/api/export/markdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown: "# Hello",
          title: "Draft.md",
        }),
      }) as never
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain(
      'filename="Draft.md"'
    );
    expect(await response.text()).toBe("# Hello");
  });
});
