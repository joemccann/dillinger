import { describe, expect, it } from "vitest";
import { formatMessage, toPersianDigits } from "@/lib/i18n";
import { MESSAGES } from "@/lib/i18n";
import { en } from "@/lib/i18n/messages/en";
import { fa } from "@/lib/i18n/messages/fa";

describe("i18n dictionaries", () => {
  it("have identical key sets across locales", () => {
    const enKeys = Object.keys(en).sort();
    const faKeys = Object.keys(fa).sort();
    expect(faKeys).toEqual(enKeys);
  });

  it("expose both locales in MESSAGES", () => {
    expect(MESSAGES.en).toBe(en);
    expect(MESSAGES.fa).toBe(fa);
  });
});

describe("formatMessage", () => {
  it("returns the plain string when no replacements are given", () => {
    expect(formatMessage(en, "settings.title")).toBe("Settings");
  });

  it("substitutes {name} placeholders", () => {
    expect(formatMessage(en, "toast.imported", { name: "notes.md" })).toBe(
      'Imported "notes.md"'
    );
  });

  it("substitutes {service} and {format} placeholders", () => {
    expect(formatMessage(en, "toast.saveSuccess", { service: "GitHub" })).toBe(
      "Successfully saved to GitHub!"
    );
    expect(formatMessage(en, "toast.exportedFormat", { format: "PDF" })).toBe(
      "Exported as PDF"
    );
  });

  it("leaves missing replacements untouched", () => {
    expect(formatMessage(en, "toast.imported", {})).toBe('Imported "{name}"');
  });

  it("falls back to English when a key is missing in fa", () => {
    // Guard: this key exists in en (so fallback is only hit if fa lacks it).
    const key = "settings.title";
    expect(formatMessage(fa, key)).toBe("تنظیمات");
    // Simulate a missing key by deleting from a copy.
    const incomplete: typeof fa = { ...fa };
    delete (incomplete as Record<string, string>)[key];
    expect(formatMessage(incomplete, key)).toBe("Settings");
  });
});

describe("toPersianDigits", () => {
  it("converts Western digits to Persian digits", () => {
    expect(toPersianDigits("2026")).toBe("۲۰۲۶");
    expect(toPersianDigits(42)).toBe("۴۲");
  });

  it("leaves non-digit characters unchanged", () => {
    expect(toPersianDigits("v1.5")).toBe("v۱.۵");
  });
});
