export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { getExportFilename, renderHtmlDocument } from "@/lib/export";
import { renderMarkdown } from "@/lib/markdown";

export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { markdown, title = "document", styled = false } = await request.json();

    if (typeof markdown !== "string" || !markdown.trim()) {
      return NextResponse.json(
        { error: "markdown field is required" },
        { status: 400 }
      );
    }

    const htmlContent = await renderMarkdown(markdown);
    const filename = getExportFilename(title, "html");
    const fullHtml = renderHtmlDocument({ title, html: htmlContent, styled });

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
