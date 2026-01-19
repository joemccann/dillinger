import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.ONEDRIVE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "OneDrive not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/onedrive/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "Files.ReadWrite.All offline_access",
  });

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
