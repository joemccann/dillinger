import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.MEDIUM_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Medium not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/medium/callback`;

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
