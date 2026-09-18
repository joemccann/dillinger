"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type LocaleId,
} from "./locales";
import {
  MESSAGES,
  formatMessage,
  toPersianDigits,
  type Replacements,
} from "./index";
import type { MessageKey } from "./types";

interface I18nContextValue {
  locale: LocaleId;
  dir: "ltr" | "rtl";
  setLocale: (locale: LocaleId) => void;
  t: (key: MessageKey, replacements?: Replacements) => string;
  formatNumber: (value: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): LocaleId {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "en" || stored === "fa") return stored;
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>(readInitialLocale);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // localStorage can throw in private/blocked contexts; ignore.
    }
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);

  const dir = locale === "fa" ? "rtl" : "ltr";

  const value = useMemo<I18nContextValue>(() => {
    const dict = MESSAGES[locale];
    return {
      locale,
      dir,
      setLocale: setLocaleState,
      t: (key, replacements) => formatMessage(dict, key, replacements),
      formatNumber: (n) => (locale === "fa" ? toPersianDigits(n) : String(n)),
    };
  }, [locale, dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    // No-op fallback (e.g. during SSR outside provider) — always English.
    return {
      locale: DEFAULT_LOCALE,
      dir: "ltr",
      setLocale: () => {},
      t: (key, replacements) => formatMessage(MESSAGES[DEFAULT_LOCALE], key, replacements),
      formatNumber: (n) => String(n),
    };
  }
  return context;
}
