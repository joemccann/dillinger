export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/env";

export async function GET() {
  const clientId = process.env.MEDIUM_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Medium not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${getAppUrl()}/api/medium/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "basicProfile,publishPost",
    state: "dillinger",
    response_type: "code",
    redirect_uri: redirectUri,
  });

  const authUrl = `https://medium.com/m/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
