"use client";

import { useMemo } from "react";
import { useStore } from "@/stores/store";
import { renderMarkdown } from "@/lib/markdown";

export function MarkdownPreview() {
  const currentDocument = useStore((state) => state.currentDocument);

  const html = useMemo(() => {
    if (!currentDocument?.body) return "";
    return renderMarkdown(currentDocument.body);
  }, [currentDocument?.body]);

  return (
    <div
      id="preview"
      className="preview-html h-full overflow-auto p-6 bg-bg-primary"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
