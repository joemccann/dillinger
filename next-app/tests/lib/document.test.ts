import { describe, expect, it } from "vitest";
import {
  countDocumentStats,
  ensureExtension,
  replaceExtension,
  sanitizeDownloadFilename,
} from "@/lib/document";

describe("document helpers", () => {
  it("normalizes filenames for downloads and exports", () => {
    expect(sanitizeDownloadFilename("My File?.md")).toBe("My_File_.md");
    expect(ensureExtension("notes", "md")).toBe("notes.md");
    expect(replaceExtension("notes.md", "html")).toBe("notes.html");
  });

  it("counts words and characters", () => {
    expect(countDocumentStats("hello world")).toEqual({
      wordCount: 2,
      characterCount: 11,
    });
  });
});
