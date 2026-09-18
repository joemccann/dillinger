/**
 * Supported locales and their metadata.
 *
 * `dir` controls text direction — Farsi (fa) is right-to-left.
 * `label` is the human-readable name shown in the language switcher.
 */
export const LOCALES = {
  en: {
    id: "en",
    dir: "ltr",
    label: "English",
  },
  fa: {
    id: "fa",
    dir: "rtl",
    label: "فارسی",
  },
} as const;

export type LocaleId = keyof typeof LOCALES;
export type LocaleDir = (typeof LOCALES)[LocaleId]["dir"];

export const DEFAULT_LOCALE: LocaleId = "en";

/** Storage key used to persist the chosen language. */
export const LOCALE_STORAGE_KEY = "dillinger-locale";

export function isLocaleId(value: string | null | undefined): value is LocaleId {
  return !!value && value in LOCALES;
}

export function getStoredLocale(): LocaleId {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocaleId(stored) ? stored : DEFAULT_LOCALE;
}

/** Simple in-page language switch (clientside). */
export function getBrowserLocale(): LocaleId {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const browserLang = window.navigator.language?.toLowerCase() ?? "";
  if (browserLang.startsWith("fa")) return "fa";
  return DEFAULT_LOCALE;
}
