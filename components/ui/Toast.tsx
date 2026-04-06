"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
}

interface ToastContextType {
  notify: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const dismiss = useCallback((id: string) => {
    setExiting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 150);
  }, []);

  const notify = useCallback((message: string, duration = 3000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]"
        role="status"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-bg-navbar text-text-invert px-4 py-3 rounded shadow-lg
                       flex items-center gap-3 transition-opacity duration-150
                       ${exiting.has(toast.id) ? "opacity-0" : "animate-in"}`}
          >
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="hover:opacity-70 transition-opacity rounded
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  // Return no-op during SSR or when outside provider
  if (!context) {
    return { notify: () => {} };
  }
  return context;
}
