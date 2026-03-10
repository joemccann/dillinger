import { replaceExtension, sanitizeDownloadFilename } from "@/lib/document";

const STYLED_EXPORT_CSS = `
  @import url("https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha2/katex.min.css");

  body {
    font-family: Georgia, Cambria, serif;
    font-size: 14px;
    line-height: 1.7;
    color: #373D49;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-weight: 600;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  h1 { font-size: 2em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  a { color: #35D7BB; text-decoration: none; }
  a:hover { text-decoration: underline; }
  code {
    font-family: "Ubuntu Mono", Monaco, monospace;
    background: #F5F7FA;
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }
  pre {
    background: #F5F7FA;
    padding: 1em;
    border-radius: 3px;
    overflow-x: auto;
  }
  .hljs {
    display: block;
    overflow-x: auto;
    padding: 0;
    color: #333;
  }
  pre code { background: none; padding: 0; }
  blockquote {
    border-left: 3px solid #A0AABF;
    padding-left: 1em;
    margin-left: 0;
    font-style: italic;
    color: #666;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid #E8E8E8;
    padding: 0.5em;
    text-align: left;
  }
  th {
    background: #F5F7FA;
    font-weight: 600;
  }
  #preview .table {
    width: auto;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  .katex-display {
    overflow-x: auto;
    overflow-y: hidden;
  }
`;

export function getExportFilename(title: string | undefined, extension: string): string {
  const safeTitle = sanitizeDownloadFilename(title?.trim() || "document");
  return sanitizeDownloadFilename(replaceExtension(safeTitle, extension));
}

export function renderHtmlDocument({
  title,
  html,
  styled,
}: {
  title?: string;
  html: string;
  styled?: boolean;
}): string {
  const styleTag = styled ? `<style>${STYLED_EXPORT_CSS}</style>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Document"}</title>
  ${styleTag}
</head>
<body id="preview">
${html}
</body>
</html>`;
}
