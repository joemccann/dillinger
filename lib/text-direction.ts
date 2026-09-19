/**
 * Arabic: U+0600–U+06FF
 * Arabic Supplement: U+0750–U+077F
 * Arabic Extended-A: U+08A0–U+08FF
 * Hebrew: U+0590–U+05FF
 */
const rtlRegex = /[\p{Script=Arabic}\p{Script=Hebrew}]/u;
const ltrRegex = /[A-Za-z]/;

export type TextDirection = "rtl" | "ltr";

export function detectTextDirection(text: string): TextDirection {

    const rtlMatch = text.match(rtlRegex);
    const ltrMatch = text.match(ltrRegex);

    if (!rtlMatch && !ltrMatch) {
        return "ltr";
    }

    if (!ltrMatch) {
        return "rtl";
    }

    if (!rtlMatch) {
        return "ltr";
    }

    return rtlMatch.index! < ltrMatch.index! ? "rtl" : "ltr";
}
