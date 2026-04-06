export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getExportFilename, renderHtmlDocument } from "@/lib/export";
import { renderMarkdown } from "@/lib/markdown";

export async function POST(request: NextRequest) {
  try {
    const { markdown, title, styled = false } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 }
      );
    }

    const htmlContent = await renderMarkdown(markdown);
    const filename = getExportFilename(title, "html");
    const fullHtml = renderHtmlDocument({
      title,
      html: htmlContent,
      styled,
    });

    return new NextResponse(fullHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
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
