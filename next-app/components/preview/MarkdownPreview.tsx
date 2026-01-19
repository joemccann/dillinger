"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { useStore } from "@/stores/store";
import { renderMarkdown } from "@/lib/markdown";

export function MarkdownPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentDocument = useStore((state) => state.currentDocument);
  const settings = useStore((state) => state.settings);
  const editorScrollPercent = useStore((state) => state.editorScrollPercent);
  const [sanitizedHtml, setSanitizedHtml] = useState("");

  const rawHtml = useMemo(() => {
    if (!currentDocument?.body) return "";
    return renderMarkdown(currentDocument.body);
  }, [currentDocument?.body]);

  // DOMPurify requires window, so we run sanitization in useEffect (client-side only)
  useEffect(() => {
    if (!rawHtml) {
      setSanitizedHtml("");
      return;
    }

    // Dynamic import DOMPurify to avoid SSR issues
    import("dompurify").then((DOMPurify) => {
      const clean = DOMPurify.default.sanitize(rawHtml, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target"], // Allow target attribute for links
        FORBID_TAGS: ["script", "style"], // Explicitly forbid dangerous tags
      });
      setSanitizedHtml(clean);
    });
  }, [rawHtml]);

  // Scroll sync with editor
  useEffect(() => {
    if (!settings.enableScrollSync || !containerRef.current) return;

    const container = containerRef.current;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    container.scrollTop = scrollHeight * editorScrollPercent;
  }, [editorScrollPercent, settings.enableScrollSync]);

  return (
    <div
      ref={containerRef}
      id="preview"
      className="preview-html h-full overflow-auto p-6 bg-bg-primary"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
