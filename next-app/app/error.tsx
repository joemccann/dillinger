"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-bg-primary">
      <h1 className="text-4xl font-bold text-text-invert mb-4 text-balance">Error</h1>
      <p className="text-text-muted mb-6">Something went wrong</p>
      <button
        onClick={reset}
        className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  );
}
