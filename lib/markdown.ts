import MarkdownIt from "markdown-it";
import markdownItAbbr from "markdown-it-abbr";
import markdownItCheckbox from "markdown-it-checkbox";
import markdownItDeflist from "markdown-it-deflist";
import markdownItFootnote from "markdown-it-footnote";
import markdownItIns from "markdown-it-ins";
import markdownItMark from "markdown-it-mark";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import markdownItTexmath from "markdown-it-texmath";
import markdownItToc from "markdown-it-toc";
import hljs from "highlight.js";
import katex from "katex";

const lineNumberRendererRuleNames = [
  "paragraph_open",
  "image",
  "code_block",
  "fence",
  "list_item_open",
] as const;

function applyLegacyRendererRules(instance: MarkdownIt) {
  instance.renderer.rules.table_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    token.attrPush(["class", "table table-striped table-bordered"]);
    return self.renderToken(tokens, idx, options);
  };

  lineNumberRendererRuleNames.forEach((ruleName) => {
    const original = instance.renderer.rules[ruleName];

    instance.renderer.rules[ruleName] = (tokens, idx, options, env, self) => {
      const token = tokens[idx];

      if (token.map?.length) {
        token.attrPush(["class", "has-line-data"]);
        token.attrPush([
          "data-line-start",
          String(ruleName === "fence" ? token.map[0] + 1 : token.map[0]),
        ]);
        token.attrPush(["data-line-end", String(token.map[1])]);
      }

      if (original) {
        return original(tokens, idx, options, env, self);
      }

      return self.renderToken(tokens, idx, options);
    };
  });

  instance.renderer.rules.heading_open = (tokens, idx) => {
    const token = tokens[idx];
    const level = token.tag;
    const label = tokens[idx + 1];

    const makeSafe = (content: string) =>
      content.replace(/[^\w\s]/g, "").trim().split(/\s+/).join("_");

    if (label?.type === "inline" && token.map?.length && label.map?.length) {
      const anchor = `${makeSafe(label.content)}_${label.map[0]}`;

      return `<${level} class="code-line has-line-data" data-line-start="${token.map[0]}" data-line-end="${token.map[1]}"><a id="${anchor}"></a>`;
    }

    return `<${level}>`;
  };
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
      } catch {
        // Fall through to default escaping.
      }
    }

    return "";
  },
})
  .use(markdownItToc)
  .use(markdownItAbbr)
  .use(markdownItCheckbox)
  .use(markdownItDeflist)
  .use(markdownItFootnote)
  .use(markdownItIns)
  .use(markdownItMark)
  .use(markdownItSub)
  .use(markdownItSup)
  .use(markdownItTexmath, {
    engine: katex,
    delimiters: "dollars",
  });

applyLegacyRendererRules(md);

export function renderMarkdown(content: string): string {
  return md.render(content);
}
