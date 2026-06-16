export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const { error: authError, headers: rlHeaders } = await validateApiKey(request);
  if (authError) return authError;

  try {
    const { url, events } = await request.json();

    if (typeof url !== "string" || !url.startsWith("https://")) {
      return NextResponse.json(
        { error: "url must be a valid HTTPS URL" },
        { status: 400 }
      );
    }

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "events must be a non-empty array" },
        { status: 400 }
      );
    }

    const validEvents = [
      "document.created",
      "document.updated",
      "document.exported",
      "document.synced",
    ];
    const invalid = events.filter(
      (e: string) => !validEvents.includes(e)
    );
    if (invalid.length > 0) {
      return NextResponse.json(
        {
          error: `Invalid events: ${invalid.join(", ")}. Valid: ${validEvents.join(", ")}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        id: `wh_${Date.now()}`,
        url,
        events,
        status: "pending",
        message:
          "Webhook registered. Note: webhook delivery requires a storage backend (coming soon).",
      },
      { headers: rlHeaders }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to register webhook" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { error: authError, headers: rlHeaders } = await validateApiKey(request);
  if (authError) return authError;

  return NextResponse.json(
    {
      webhooks: [],
      message:
        "Webhook storage not yet configured. Registered webhooks are not persisted.",
    },
    { headers: rlHeaders }
  );
}
