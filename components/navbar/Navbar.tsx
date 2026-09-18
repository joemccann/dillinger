"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { importDocumentFile, ImportError } from "@/lib/import";
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
  Upload,
  ImagePlus,
  HelpCircle,
  Languages,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

type ExportFormat = "markdown" | "html" | "pdf";

function getDownloadFilename(response: Response, fallback: string): string {
  const contentDisposition = response.headers.get("Content-Disposition");
  const match = contentDisposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
}

export function Navbar() {
  const { t } = useI18n();
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const toggleSettings = useStore((state) => state.toggleSettings);
  const togglePreview = useStore((state) => state.togglePreview);
  const previewVisible = useStore((state) => state.previewVisible);
  const currentDocument = useStore((state) => state.currentDocument);
  const createImportedDocument = useStore((state) => state.createImportedDocument);
  const insertMarkdownAtCursor = useStore((state) => state.insertMarkdownAtCursor);
  const setZenMode = useStore((state) => state.setZenMode);
  const toggleShortcuts = useStore((state) => state.toggleShortcuts);
  const { notify } = useToast();
  const { upload } = useImageUpload();

  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = useCallback(async (
    format: ExportFormat,
    options?: { styled?: boolean }
  ) => {
    if (!currentDocument) return;
    setExportOpen(false);

    const formatLabel = format === "html" && options?.styled
      ? "styled HTML"
      : format.toUpperCase();

    try {
      notify(t("toast.exportPreparing", { format: formatLabel }));

      const response = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: currentDocument.body,
          title: currentDocument.title,
          styled: options?.styled,
        }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getDownloadFilename(
        response,
        `${currentDocument.title}.${format === "markdown" ? "md" : format}`
      );
      a.click();
      URL.revokeObjectURL(url);

      notify(
        format === "html" && options?.styled === true
          ? t("toast.exportedStyledHtml")
          : t("toast.exportedFormat", { format: format.toUpperCase() })
      );
    } catch (error) {
      if (error instanceof TypeError) {
        notify(t("toast.exportFailedConnection", { format: formatLabel }));
      } else {
        notify(t("toast.exportFailed", { format: formatLabel }));
      }
    }
  }, [currentDocument, notify, t]);

  const handleImportSelection = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const imported = await importDocumentFile(file);
      createImportedDocument(file.name, imported.body);
      notify(t("toast.imported", { name: file.name }));
    } catch (error) {
      notify(
        error instanceof ImportError
          ? t(
              error.code === "unsupported_type"
                ? "import.unsupportedType"
                : "import.convertFailed"
            )
          : error instanceof Error
            ? error.message
            : t("toast.importFailed")
      );
    }
  }, [createImportedDocument, notify, t]);

  const handleImageSelection = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const result = await upload(file);
    if (!result) {
      return;
    }

    insertMarkdownAtCursor(`\n${result.markdown}\n`);
  }, [upload, insertMarkdownAtCursor]);

  return (
    <nav className="h-14 bg-bg-navbar flex items-center justify-between px-4 z-navbar">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          aria-label={t("navbar.toggleSidebar")}
          className="text-text-invert hover:text-plum transition-all active:scale-[0.97]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar rounded"
        >
          <Menu size={24} />
        </button>
        <span className="text-plum font-bold text-xl tracking-wide hidden sm:block">
          DILLINGER
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => importInputRef.current?.click()}
          aria-label={t("navbar.importFile")}
          title={t("navbar.importFile")}
          className="text-text-invert hover:text-plum transition-all active:scale-[0.97] px-3 py-2
                     flex items-center gap-1 text-sm rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
        >
          <Upload size={18} />
          <span className="hidden sm:inline">{t("navbar.import")}</span>
        </button>

        <button
          onClick={() => imageInputRef.current?.click()}
          aria-label={t("navbar.insertImage")}
          title={t("navbar.insertImage")}
          className="text-text-invert hover:text-plum transition-all active:scale-[0.97] px-3 py-2
                     flex items-center gap-1 text-sm rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
        >
          <ImagePlus size={18} />
          <span className="hidden sm:inline">{t("navbar.image")}</span>
        </button>

        {/* Export dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            aria-expanded={exportOpen}
            aria-haspopup="menu"
            aria-label={t("navbar.exportDocument")}
            className="text-text-invert hover:text-plum transition-all active:scale-[0.97] px-3 py-2
                       flex items-center gap-1 text-sm rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
          >
            <Download size={18} />
            <span className="hidden sm:inline">{t("navbar.exportAs")}</span>
          </button>
          {exportOpen && (
            <div
              role="menu"
              aria-label={t("navbar.exportFormats")}
              className={"absolute right-0 top-full mt-1 bg-bg-navbar rounded shadow-lg py-1 min-w-[150px] animate-fade-in rtl:left-0 rtl:right-auto"}
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
                onClick={() => handleExport("html", { styled: false })}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm
                           focus-visible:outline-none focus-visible:bg-bg-highlight"
              >
                <FileCode size={16} />
                HTML
              </button>
              <button
                role="menuitem"
                onClick={() => handleExport("html", { styled: true })}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm
                           focus-visible:outline-none focus-visible:bg-bg-highlight"
              >
                <FileCode size={16} />
                Styled HTML
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
          aria-label={previewVisible ? t("navbar.hidePreview") : t("navbar.showPreview")}
          title={previewVisible ? t("navbar.hidePreview") : t("navbar.showPreview")}
          aria-pressed={previewVisible}
          className="text-text-invert hover:text-plum transition-all active:scale-[0.97] p-2 rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
        >
          {previewVisible ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>

        {/* Zen mode */}
        <button
          onClick={() => setZenMode(true)}
          aria-label={t("navbar.enterZenMode")}
          title={t("navbar.zenModeShortcut")}
          className="text-text-invert hover:text-plum transition-all active:scale-[0.97] p-2 rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
        >
          <Maximize2 size={20} />
        </button>

        {/* Settings */}
        <button
          onClick={toggleSettings}
          aria-label={t("navbar.openSettings")}
          title={t("settings.title")}
          className="text-text-invert hover:text-plum transition-all active:scale-[0.97] p-2 rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
        >
          <Settings size={20} />
        </button>

        {/* Language switcher */}
        <LanguageSwitcher />

        <button
          onClick={toggleShortcuts}
          title={t("shortcuts.keyboardShortcuts")}
          aria-label={t("shortcuts.keyboardShortcuts")}
          className="text-text-invert hover:text-plum transition-all active:scale-[0.97] p-2 rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
        >
          <HelpCircle size={20} />
        </button>
      </div>

      <input
        ref={importInputRef}
        type="file"
        accept=".md,.markdown,.txt,.html,.htm,text/plain,text/markdown,text/html"
        data-testid="document-import-input"
        className="hidden"
        onChange={handleImportSelection}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        data-testid="image-import-input"
        className="hidden"
        onChange={handleImageSelection}
      />
    </nav>
  );
}

/**
 * A compact language toggle (EN / FA) shown in the navbar.
 * Cycles through available locales on click; keeps document focus.
 */
function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const switchTo = (next: "en" | "fa") => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("settings.language")}
        title={t("settings.language")}
        className="text-text-invert hover:text-plum transition-all active:scale-[0.97] p-2 rounded
                   flex items-center gap-1 text-sm
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
      >
        <Languages size={18} />
        <span className="hidden sm:inline uppercase text-xs font-semibold tracking-wide">
          {locale}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t("settings.language")}
          className="absolute right-0 top-full mt-1 bg-bg-navbar rounded shadow-lg py-1 min-w-[120px] animate-fade-in rtl:left-0 rtl:right-auto"
        >
          <button
            role="menuitem"
            onClick={() => switchTo("en")}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-bg-highlight
                       focus-visible:outline-none focus-visible:bg-bg-highlight ${
                         locale === "en" ? "text-plum" : "text-text-invert"
                       }`}
          >
            <span>{t("settings.english")}</span>
            {locale === "en" && <span className="mr-auto text-plum">✓</span>}
          </button>
          <button
            role="menuitem"
            onClick={() => switchTo("fa")}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-bg-highlight
                       focus-visible:outline-none focus-visible:bg-bg-highlight ${
                         locale === "fa" ? "text-plum" : "text-text-invert"
                       }`}
          >
            <span>{t("settings.farsi")}</span>
            {locale === "fa" && <span className="mr-auto text-plum">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
