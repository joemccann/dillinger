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
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const toggleSettings = useStore((state) => state.toggleSettings);
  const togglePreview = useStore((state) => state.togglePreview);
  const previewVisible = useStore((state) => state.previewVisible);
  const currentDocument = useStore((state) => state.currentDocument);
  const { notify } = useToast();

  const [exportOpen, setExportOpen] = useState(false);

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
          className="text-text-invert hover:text-plum transition-colors"
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
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="text-text-invert hover:text-plum transition-colors px-3 py-2
                       flex items-center gap-1 text-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export as</span>
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-1 bg-bg-navbar rounded shadow-lg py-1 min-w-[150px]">
              <button
                onClick={() => handleExport("markdown")}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm"
              >
                <FileText size={16} />
                Markdown
              </button>
              <button
                onClick={() => handleExport("html")}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm"
              >
                <FileCode size={16} />
                HTML
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm"
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
          className="text-text-invert hover:text-plum transition-colors p-2"
          title={previewVisible ? "Hide preview" : "Show preview"}
        >
          {previewVisible ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>

        {/* Settings */}
        <button
          onClick={toggleSettings}
          className="text-text-invert hover:text-plum transition-colors p-2"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
}
