export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import TurndownService from "turndown";

const turndown = new TurndownService({
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  headingStyle: "atx",
});

turndown.addRule("strikethrough", {
  filter: ["del", "s", "strike"] as unknown as string[],
  replacement(content: string) {
    return `~~${content}~~`;
  },
});

export async function POST(request: NextRequest) {
  const { error: authError, headers: rlHeaders } = await validateApiKey(request);
  if (authError) return authError;

  try {
    const { html } = await request.json();

    if (typeof html !== "string" || !html.trim()) {
      return NextResponse.json(
        { error: "html field is required" },
        { status: 400 }
      );
    }

    const markdown = turndown.turndown(html).trim();

    return NextResponse.json({ markdown }, { headers: rlHeaders });
  } catch {
    return NextResponse.json(
      { error: "Failed to convert HTML to markdown" },
      { status: 500 }
    );
  }
}
