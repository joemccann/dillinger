export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import TurndownService from "turndown";

const turndown = new TurndownService({
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  headingStyle: "atx",
});

turndown.addRule("strikethrough", {
  filter: ["del", "s", "strike"],
  replacement(content) {
    return `~~${content}~~`;
  },
});

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json();

    if (typeof html !== "string" || html.trim().length === 0) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      markdown: turndown.turndown(html).trim(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to convert HTML to Markdown" },
      { status: 500 }
    );
  }
}
