import type { LocaleId } from "./locales";
import type { MessageDict, MessageKey } from "./types";
import { en } from "./messages/en";
import { fa } from "./messages/fa";

/** Flat dictionaries for each locale. */
export const MESSAGES: Record<LocaleId, MessageDict> = {
  en,
  fa,
};

/** Persian/Arabic-Indic digits used for Farsi number formatting. */
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export type Replacements = Record<string, string | number>;

/**
 * Look up a translated string and substitute `{name}` placeholders.
 *
 * Example: formatMessage("toast.imported", { name: "notes.md" })
 */
export function formatMessage(
  dict: MessageDict,
  key: MessageKey,
  replacements?: Replacements
): string {
  const pattern = dict[key];
  if (pattern === undefined) {
    // Fall back to the English value so a missing key never renders blank.
    return formatMessage(en, key, replacements);
  }
  if (!replacements) return pattern;

  return pattern.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = replacements[name];
    return value === undefined ? match : String(value);
  });
}
