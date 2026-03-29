// @vitest-environment node

import { describe, expect, it } from "vitest";
import { POST as exportHtml } from "@/app/api/export/html/route";

describe("POST /api/export/html", () => {
  it("rejects missing markdown", async () => {
    const response = await exportHtml(
      new Request("http://localhost/api/export/html", {
        method: "POST",
        body: JSON.stringify({}),
      }) as never
    );

    expect(response.status).toBe(400);
  });

  it("renders styled and plain HTML variants with stable filenames", async () => {
    const markdown = "# Exported";

    const styledResponse = await exportHtml(
      new Request("http://localhost/api/export/html", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown,
          title: "Exported.md",
          styled: true,
        }),
      }) as never
    );

    const plainResponse = await exportHtml(
      new Request("http://localhost/api/export/html", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown,
          title: "Exported.md",
          styled: false,
        }),
      }) as never
    );

    expect(styledResponse.headers.get("Content-Disposition")).toContain(
      'filename="Exported.html"'
    );
    expect(await styledResponse.text()).toContain("<style>");
    expect(await plainResponse.text()).not.toContain("<style>");
  });
});
