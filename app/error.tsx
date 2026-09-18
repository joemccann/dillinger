"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-bg-primary">
      <h1 className="text-4xl font-bold text-text-invert mb-4 text-balance">{t("error.title")}</h1>
      <p className="text-text-muted mb-6">{t("error.description")}</p>
      <button
        onClick={reset}
        className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium hover:opacity-90 transition-opacity"
      >
        {t("error.tryAgain")}
      </button>
    </div>
  );
}
