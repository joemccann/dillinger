"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentTitle: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  documentTitle,
}: DeleteConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Focus the cancel button when modal opens
    cancelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-500" />
          </div>

          <h2
            id="delete-modal-title"
            className="text-lg font-semibold text-text-invert mb-2"
          >
            Delete Document
          </h2>

          <p
            id="delete-modal-description"
            className="text-text-muted text-sm mb-6"
          >
            Are you sure you want to delete &quot;{documentTitle}&quot;? This action cannot be undone.
          </p>

          <div className="flex gap-3 w-full">
            <button
              ref={cancelRef}
              onClick={onClose}
              className="flex-1 bg-bg-button-save text-text-invert py-2 px-4 rounded font-medium
                         hover:opacity-90 transition-opacity
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded font-medium
                         hover:bg-red-700 transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
