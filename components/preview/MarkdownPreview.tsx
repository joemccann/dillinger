"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { useStore } from "@/stores/store";
import { renderMarkdown } from "@/lib/markdown";

export function MarkdownPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentDocument = useStore((state) => state.currentDocument);
  const settings = useStore((state) => state.settings);
  const editorScrollPercent = useStore((state) => state.editorScrollPercent);
  const editorTopLine = useStore((state) => state.editorTopLine);
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
        USE_PROFILES: { html: true, mathMl: true, svg: true },
        ADD_ATTR: ["target", "class", "data-line-start", "data-line-end"],
        FORBID_TAGS: ["script", "style"], // Explicitly forbid dangerous tags
      });
      setSanitizedHtml(clean);
    });
  }, [rawHtml]);

  // Scroll sync with editor
  useEffect(() => {
    if (!settings.enableScrollSync || !containerRef.current) return;

    const container = containerRef.current;
    const lineAnchors = Array.from(
      container.querySelectorAll<HTMLElement>("[data-line-start]")
    );

    if (lineAnchors.length > 0) {
      let target = lineAnchors[0];

      for (const anchor of lineAnchors) {
        const startLine = Number(anchor.dataset.lineStart || "0");
        if (startLine <= editorTopLine) {
          target = anchor;
        } else {
          break;
        }
      }

      container.scrollTop = target.offsetTop;
      return;
    }

    const scrollHeight = container.scrollHeight - container.clientHeight;
    container.scrollTop = scrollHeight * editorScrollPercent;
  }, [editorScrollPercent, editorTopLine, sanitizedHtml, settings.enableScrollSync]);

  return (
    <div
      ref={containerRef}
      id="preview"
      data-testid="preview-pane"
      className={`preview-html h-full overflow-auto p-6 ${
        settings.enableNightMode ? 'dark bg-[#1e1e1e]' : 'bg-bg-primary'
      }`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
