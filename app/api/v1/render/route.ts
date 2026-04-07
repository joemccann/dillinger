export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { renderMarkdown } from "@/lib/markdown";

export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { markdown } = await request.json();

    if (typeof markdown !== "string" || !markdown.trim()) {
      return NextResponse.json(
        { error: "markdown field is required" },
        { status: 400 }
      );
    }

    const html = await renderMarkdown(markdown);

    return NextResponse.json({ html });
  } catch {
    return NextResponse.json(
      { error: "Failed to render markdown" },
      { status: 500 }
    );
  }
}
