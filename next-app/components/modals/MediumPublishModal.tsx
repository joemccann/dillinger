"use client";

import { useState, useEffect, useRef } from "react";
import { useMedium } from "@/hooks/useMedium";
import { useStore } from "@/stores/store";
import { X, Pencil, Send, ExternalLink } from "lucide-react";

interface MediumPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MediumPublishModal({ isOpen, onClose }: MediumPublishModalProps) {
  const medium = useMedium();
  const currentDocument = useStore((state) => state.currentDocument);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [publishStatus, setPublishStatus] = useState<"public" | "draft" | "unlisted">("draft");
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentDocument?.title || "");
      setTags("");
      setPublishStatus("draft");
      setPublishedUrl(null);
    }
  }, [isOpen, currentDocument?.title]);

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!currentDocument) return;

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const result = await medium.publish(
      title,
      currentDocument.body,
      tagArray,
      publishStatus
    );

    if (result) {
      setPublishedUrl(result.url);
    }
  };

  // Not connected state
  if (!medium.isConnected) {
    return (
      <div
        className="fixed inset-0 z-modal flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="medium-connect-title"
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-md p-6">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-text-invert hover:text-plum rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <Pencil size={48} className="mx-auto text-text-invert mb-4" aria-hidden="true" />
            <h2 id="medium-connect-title" className="text-xl font-semibold text-text-invert mb-2 text-balance">
              Connect to Medium
            </h2>
            <p className="text-text-muted mb-6">
              Connect your Medium account to publish your markdown as blog posts.
            </p>
            <button
              onClick={medium.connect}
              className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium
                         hover:opacity-90 transition-opacity
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
            >
              Connect Medium
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (publishedUrl) {
    return (
      <div
        className="fixed inset-0 z-modal flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="medium-success-title"
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-md p-6">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-text-invert hover:text-plum rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="size-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-green-400" />
            </div>
            <h2 id="medium-success-title" className="text-xl font-semibold text-text-invert mb-2 text-balance">
              Published Successfully
            </h2>
            <p className="text-text-muted mb-6">
              Your post has been published to Medium as a {publishStatus}.
            </p>
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-plum text-bg-sidebar px-6 py-2 rounded font-medium
                         hover:opacity-90 transition-opacity
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
            >
              View on Medium
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medium-publish-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <div className="flex items-center gap-2">
            <Pencil size={24} className="text-text-invert" aria-hidden="true" />
            <h2 id="medium-publish-title" className="text-lg font-semibold text-text-invert text-balance">
              Publish to Medium
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="text-text-invert hover:text-plum rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {medium.user && (
            <p className="text-text-muted text-sm">
              Publishing as <span className="text-text-invert">{medium.user.name}</span>
            </p>
          )}

          <div>
            <label htmlFor="medium-title" className="block text-sm text-text-muted mb-1">
              Title
            </label>
            <input
              id="medium-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full bg-bg-highlight text-text-invert px-3 py-2 rounded
                         border border-border-settings
                         focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            />
          </div>

          <div>
            <label htmlFor="medium-tags" className="block text-sm text-text-muted mb-1">
              Tags (comma separated)
            </label>
            <input
              id="medium-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="programming, javascript, tutorial"
              className="w-full bg-bg-highlight text-text-invert px-3 py-2 rounded
                         border border-border-settings
                         focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            />
          </div>

          <div>
            <label htmlFor="publish-status" className="block text-sm text-text-muted mb-1">
              Publish Status
            </label>
            <select
              id="publish-status"
              value={publishStatus}
              onChange={(e) => setPublishStatus(e.target.value as "public" | "draft" | "unlisted")}
              className="w-full bg-bg-highlight text-text-invert px-3 py-2 rounded
                         border border-border-settings
                         focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            >
              <option value="draft">Draft</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-settings">
          <button
            onClick={handlePublish}
            disabled={medium.isPublishing || !title.trim()}
            className="w-full bg-plum text-bg-sidebar py-2 px-4 rounded font-medium
                       hover:opacity-90 transition-opacity flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
          >
            <Send size={18} />
            {medium.isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
