declare module "markdown-it-toc" {
  import MarkdownIt from "markdown-it";

  export default function markdownItToc(md: MarkdownIt): void;
}

declare module "markdown-it-texmath" {
  import MarkdownIt from "markdown-it";

  interface TexmathOptions {
    engine: unknown;
    delimiters?: string;
  }

  export default function markdownItTexmath(md: MarkdownIt, options?: TexmathOptions): void;
}

declare module "breakdance" {
  export default function breakdance(html: string): string;
}

declare module "turndown" {
  interface TurndownRule {
    filter: string | string[] | ((node: unknown, options: unknown) => boolean);
    replacement: (content: string, node: unknown, options: unknown) => string;
  }

  interface TurndownOptions {
    bulletListMarker?: "-" | "+" | "*";
    codeBlockStyle?: "fenced" | "indented";
    headingStyle?: "atx" | "setext";
  }

  export default class TurndownService {
    constructor(options?: TurndownOptions);
    addRule(key: string, rule: TurndownRule): this;
    turndown(input: string | Node): string;
  }
}
