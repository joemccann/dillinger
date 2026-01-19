import MarkdownIt from "markdown-it";
import markdownItAbbr from "markdown-it-abbr";
import markdownItCheckbox from "markdown-it-checkbox";
import markdownItDeflist from "markdown-it-deflist";
import markdownItFootnote from "markdown-it-footnote";
import markdownItIns from "markdown-it-ins";
import markdownItMark from "markdown-it-mark";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import hljs from "highlight.js";

export const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
      } catch {
        // Fall through to default
      }
    }
    return ""; // Use external default escaping
  },
})
  .use(markdownItAbbr)
  .use(markdownItCheckbox)
  .use(markdownItDeflist)
  .use(markdownItFootnote)
  .use(markdownItIns)
  .use(markdownItMark)
  .use(markdownItSub)
  .use(markdownItSup);

export function renderMarkdown(content: string): string {
  return md.render(content);
}
