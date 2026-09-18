"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-bg-primary">
      <h1 className="text-4xl font-bold text-text-invert mb-4 text-balance">404</h1>
      <p className="text-text-muted mb-6">{t("notFound.description")}</p>
      <Link
        href="/"
        className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium hover:opacity-90 transition-opacity"
      >
        {t("notFound.goHome")}
      </Link>
    </div>
  );
}
