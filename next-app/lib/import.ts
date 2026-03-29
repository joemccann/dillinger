"use client";

import {
  isHtmlFilename,
  isMarkdownFilename,
  stripKnownExtension,
} from "@/lib/document";

interface ImportedDocument {
  body: string;
  title: string;
}

async function convertHtmlToMarkdown(html: string): Promise<string> {
  const response = await fetch("/api/import/html-to-markdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to convert HTML");
  }

  return data.markdown;
}

export async function importDocumentFile(file: File): Promise<ImportedDocument> {
  if (isMarkdownFilename(file.name)) {
    return {
      body: await file.text(),
      title: stripKnownExtension(file.name),
    };
  }

  if (isHtmlFilename(file.name) || file.type === "text/html") {
    const html = await file.text();
    return {
      body: await convertHtmlToMarkdown(html),
      title: stripKnownExtension(file.name),
    };
  }

  throw new Error("Please choose a .md, .txt, .markdown, .html, or .htm file");
}
