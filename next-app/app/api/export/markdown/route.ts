export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getExportFilename } from "@/lib/export";

export async function POST(request: NextRequest) {
  try {
    const { markdown, title } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 }
      );
    }

    const filename = getExportFilename(title, "md");

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to export markdown" },
      { status: 500 }
    );
  }
}
