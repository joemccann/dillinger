"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: "Editor",
    shortcuts: [
      { keys: ["⌘", "Z"], action: "Undo" },
      { keys: ["⌘", "⇧", "Z"], action: "Redo" },
      { keys: ["⌘", "X"], action: "Cut line" },
      { keys: ["⌘", "D"], action: "Duplicate line" },
      { keys: ["⌘", "/"], action: "Toggle comment" },
      { keys: ["⌘", "F"], action: "Find" },
      { keys: ["⌘", "H"], action: "Find and replace" },
    ],
  },
  {
    title: "View",
    shortcuts: [
      { keys: ["⌘", "⇧", "Z"], action: "Toggle zen mode" },
      { keys: ["Escape"], action: "Exit zen mode" },
    ],
  },
  {
    title: "Help",
    shortcuts: [
      { keys: ["?"], action: "Keyboard shortcuts" },
    ],
  },
];

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    closeRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-bg-navbar rounded-lg shadow-xl p-6 w-96 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 id="shortcuts-title" className="text-text-invert font-semibold">
            Keyboard Shortcuts
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="text-text-invert hover:text-plum transition-colors rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.action}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-text-muted">{shortcut.action}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <kbd
                          key={`${shortcut.action}-${i}`}
                          className="bg-bg-highlight text-text-invert px-2.5 py-0.5 rounded text-xs font-mono min-w-[24px] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
