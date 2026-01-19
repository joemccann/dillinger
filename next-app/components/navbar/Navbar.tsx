"use client";

import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import {
  Menu,
  Eye,
  EyeOff,
  Settings,
  Download,
  FileText,
  FileCode,
  FileType,
  Maximize2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function Navbar() {
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const toggleSettings = useStore((state) => state.toggleSettings);
  const togglePreview = useStore((state) => state.togglePreview);
  const previewVisible = useStore((state) => state.previewVisible);
  const currentDocument = useStore((state) => state.currentDocument);
  const setZenMode = useStore((state) => state.setZenMode);
  const { notify } = useToast();

  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on Escape key or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && exportOpen) {
        setExportOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportOpen]);

  const handleExport = async (format: "markdown" | "html" | "pdf") => {
    if (!currentDocument) return;
    setExportOpen(false);

    try {
      const response = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: currentDocument.body,
          title: currentDocument.title,
        }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentDocument.title}.${format === "markdown" ? "md" : format}`;
      a.click();
      URL.revokeObjectURL(url);

      notify(`Exported as ${format.toUpperCase()}`);
    } catch {
      notify("Export failed");
    }
  };

  return (
    <nav className="h-14 bg-bg-navbar flex items-center justify-between px-4 z-navbar">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="text-text-invert hover:text-plum transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar rounded"
        >
          <Menu size={24} />
        </button>
        <span className="text-plum font-bold text-lg hidden sm:block">
          DILLINGER
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Export dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            aria-expanded={exportOpen}
            aria-haspopup="menu"
            aria-label="Export document"
            className="text-text-invert hover:text-plum transition-colors px-3 py-2
                       flex items-center gap-1 text-sm rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export as</span>
          </button>
          {exportOpen && (
            <div
              role="menu"
              aria-label="Export formats"
              className="absolute right-0 top-full mt-1 bg-bg-navbar rounded shadow-lg py-1 min-w-[150px]"
            >
              <button
                role="menuitem"
                onClick={() => handleExport("markdown")}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm
                           focus-visible:outline-none focus-visible:bg-bg-highlight"
              >
                <FileText size={16} />
                Markdown
              </button>
              <button
                role="menuitem"
                onClick={() => handleExport("html")}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm
                           focus-visible:outline-none focus-visible:bg-bg-highlight"
              >
                <FileCode size={16} />
                HTML
              </button>
              <button
                role="menuitem"
                onClick={() => handleExport("pdf")}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm
                           focus-visible:outline-none focus-visible:bg-bg-highlight"
              >
                <FileType size={16} />
                PDF
              </button>
            </div>
          )}
        </div>

        {/* Preview toggle */}
        <button
          onClick={togglePreview}
          aria-label={previewVisible ? "Hide preview" : "Show preview"}
          aria-pressed={previewVisible}
          className="text-text-invert hover:text-plum transition-colors p-2 rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
        >
          {previewVisible ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>

        {/* Zen mode */}
        <button
          onClick={() => setZenMode(true)}
          aria-label="Enter zen mode"
          className="text-text-invert hover:text-plum transition-colors p-2 rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
        >
          <Maximize2 size={20} />
        </button>

        {/* Settings */}
        <button
          onClick={toggleSettings}
          aria-label="Open settings"
          className="text-text-invert hover:text-plum transition-colors p-2 rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
        >
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
}
