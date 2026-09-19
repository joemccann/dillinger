import type MarkdownIt from "markdown-it";
import { detectTextDirection } from "./text-direction";

const lineNumberRendererRuleNames = [
    "paragraph_open",
    "image",
    "code_block",
    "fence",
    "list_item_open",
    "bullet_list_open",
    "ordered_list_open",
] as const;

function applyLegacyRendererRules(instance: MarkdownIt) {
    instance.renderer.rules.table_open = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        token.attrPush(["class", "table table-striped table-bordered"]);
        return self.renderToken(tokens, idx, options);
    };

    instance.renderer.rules.td_open = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const contentToken = tokens[idx + 1];

        if (contentToken?.type === "inline") {
            const direction = detectTextDirection(contentToken.content);

            token.attrSet("dir", direction);
            token.attrSet("style", `text-align: ${direction === "rtl" ? "right" : "left"}`);
        }

        return self.renderToken(tokens, idx, options);
    };

    instance.renderer.rules.th_open = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const contentToken = tokens[idx + 1];

        if (contentToken?.type === "inline") {
            const direction = detectTextDirection(contentToken.content);

            token.attrSet("dir", direction);
            token.attrSet("style", `text-align: ${direction === "rtl" ? "right" : "left"}`);
        }

        return self.renderToken(tokens, idx, options);
    };

    instance.renderer.rules.blockquote_open = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const inlineToken = tokens[idx + 2];

        if (inlineToken?.type === "inline") {
            token.attrSet("dir", detectTextDirection(inlineToken.content));
        }

        return self.renderToken(tokens, idx, options);
    };

    lineNumberRendererRuleNames.forEach((ruleName) => {

        const renderList = (tokens: any[], idx: number, options: any, env: any, self: any) => {
            const token = tokens[idx];
            let direction = "ltr";
            for (let i = idx + 1; i < tokens.length; i++) {
                if (tokens[i].type === "inline") {
                    direction = detectTextDirection(tokens[i].content);
                    break;
                }

                if (
                    tokens[i].type === "bullet_list_close" ||
                    tokens[i].type === "ordered_list_close"
                ) {
                    break;
                }
            }
            token.attrSet("dir", direction);
            return self.renderToken(tokens, idx, options);
        };
        instance.renderer.rules.bullet_list_open = renderList;
        instance.renderer.rules.ordered_list_open = renderList;


        const original = instance.renderer.rules[ruleName];

        instance.renderer.rules[ruleName] = (tokens, idx, options, env, self) => {
            const token = tokens[idx];

            if (ruleName === "paragraph_open") {
                const contentToken = tokens[idx + 1];

                if (contentToken?.type === "inline") {
                    token.attrPush(["dir", detectTextDirection(contentToken.content)]);
                }
            }

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
            const direction = detectTextDirection(label.content);
            return `<${level} dir="${direction}" class="code-line has-line-data" data-line-start="${token.map[0]}" data-line-end="${token.map[1]}"><a id="${anchor}"></a>`;
        }

        return `<${level}>`;
    };
}

let md: MarkdownIt | null = null;

async function getMarkdownRenderer(): Promise<MarkdownIt> {
    if (md) return md;

    const [
        { default: MarkdownIt },
        { default: markdownItAbbr },
        { default: markdownItCheckbox },
        { default: markdownItDeflist },
        { default: markdownItFootnote },
        { default: markdownItIns },
        { default: markdownItMark },
        { default: markdownItSub },
        { default: markdownItSup },
        { default: markdownItTexmath },
        { default: markdownItToc },
        { default: hljs },
        { default: katex },
    ] = await Promise.all([
        import("markdown-it"),
        import("markdown-it-abbr"),
        import("markdown-it-checkbox"),
        import("markdown-it-deflist"),
        import("markdown-it-footnote"),
        import("markdown-it-ins"),
        import("markdown-it-mark"),
        import("markdown-it-sub"),
        import("markdown-it-sup"),
        import("markdown-it-texmath"),
        import("markdown-it-toc"),
        import("highlight.js"),
        import("katex"),
    ]);

    md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        breaks: true,
        highlight: (str: string, lang: string): string => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, { language: lang, ignoreIllegals: true })
                        .value;
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

    return md;
}

export async function renderMarkdown(content: string): Promise<string> {
    const renderer = await getMarkdownRenderer();
    return renderer.render(content);
}
