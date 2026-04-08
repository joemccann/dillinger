export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { getExportFilename } from "@/lib/export";
import { renderPdfBuffer } from "@/lib/pdf";

export async function POST(request: NextRequest) {
  const { error: authError, headers: rlHeaders } = await validateApiKey(request);
  if (authError) return authError;

  try {
    const { markdown, title = "document" } = await request.json();

    if (typeof markdown !== "string" || !markdown.trim()) {
      return NextResponse.json(
        { error: "markdown field is required" },
        { status: 400 }
      );
    }

    const pdf = await renderPdfBuffer({ markdown, title });
    const filename = getExportFilename(title, "pdf");

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        ...rlHeaders,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to export PDF" },
      { status: 500 }
    );
  }
}
