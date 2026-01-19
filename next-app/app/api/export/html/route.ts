import { NextRequest, NextResponse } from "next/server";
import { renderMarkdown } from "@/lib/markdown";

export async function POST(request: NextRequest) {
  try {
    const { markdown, title } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 }
      );
    }

    const htmlContent = renderMarkdown(markdown);
    const filename = `${title || "document"}.html`;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Document"}</title>
  <style>
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
    pre code { background: none; padding: 0; }
    blockquote {
      border-left: 3px solid #A0AABF;
      padding-left: 1em;
      margin-left: 0;
      font-style: italic;
      color: #666;
    }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #E8E8E8; padding: 0.5em; text-align: left; }
    th { background: #F5F7FA; font-weight: 600; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    return new NextResponse(fullHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to export HTML" },
      { status: 500 }
    );
  }
}
