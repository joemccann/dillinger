declare module "markdown-it-abbr" {
  import MarkdownIt from "markdown-it";
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module "markdown-it-checkbox" {
  import MarkdownIt from "markdown-it";
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module "markdown-it-deflist" {
  import MarkdownIt from "markdown-it";
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module "markdown-it-footnote" {
  import MarkdownIt from "markdown-it";
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module "markdown-it-ins" {
  import MarkdownIt from "markdown-it";
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module "markdown-it-mark" {
  import MarkdownIt from "markdown-it";
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module "markdown-it-sub" {
  import MarkdownIt from "markdown-it";
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module "markdown-it-sup" {
  import MarkdownIt from "markdown-it";
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module "markdown-it-texmath" {
  import MarkdownIt from "markdown-it";

  interface TexmathOptions {
    engine?: unknown;
    delimiters?: string;
  }

  const plugin: MarkdownIt.PluginWithOptions<TexmathOptions>;
  export default plugin;
}

declare module "markdown-it-toc" {
  import MarkdownIt from "markdown-it";

  type TocOptions = Record<string, unknown>;

  const plugin: MarkdownIt.PluginWithOptions<TocOptions>;
  export default plugin;
}
