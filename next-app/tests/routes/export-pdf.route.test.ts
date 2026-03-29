// @vitest-environment node

import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/pdf", () => ({
  renderPdfBuffer: vi.fn(),
}));

import { POST as exportPdf } from "@/app/api/export/pdf/route";
import { renderPdfBuffer } from "@/lib/pdf";

const renderPdfBufferMock = vi.mocked(renderPdfBuffer);
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

describe("POST /api/export/pdf", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("rejects missing markdown", async () => {
    const response = await exportPdf(
      new Request("http://localhost/api/export/pdf", {
        method: "POST",
        body: JSON.stringify({}),
      }) as never
    );

    expect(response.status).toBe(400);
  });

  it("returns a PDF attachment with a stable filename", async () => {
    renderPdfBufferMock.mockResolvedValue(Buffer.from("%PDF-1.4"));

    const response = await exportPdf(
      new Request("http://localhost/api/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown: "# Exported",
          title: "Exported.md",
        }),
      }) as never
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain(
      'filename="Exported.pdf"'
    );
    expect(Buffer.from(await response.arrayBuffer()).toString()).toContain("%PDF-1.4");
  });

  it("returns 500 when PDF generation fails", async () => {
    renderPdfBufferMock.mockRejectedValue(new Error("missing chrome"));

    const response = await exportPdf(
      new Request("http://localhost/api/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown: "# Exported",
          title: "Exported.md",
        }),
      }) as never
    );

    expect(response.status).toBe(500);
  });
});
