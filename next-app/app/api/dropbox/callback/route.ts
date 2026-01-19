import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${baseUrl}?dropbox_error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}?dropbox_error=no_code`);
  }

  try {
    const clientId = process.env.DROPBOX_APP_KEY!;
    const clientSecret = process.env.DROPBOX_APP_SECRET!;
    const redirectUri = `${baseUrl}/api/dropbox/callback`;

    // Exchange code for token using direct API call (Dropbox SDK has issues with fetch in Node.js)
    const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Dropbox token exchange failed:", errorText);
      return NextResponse.redirect(`${baseUrl}?dropbox_error=token_exchange_failed`);
    }

    const result = await tokenResponse.json();

    // Store tokens in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(
      "dropbox_token",
      JSON.stringify({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      }
    );

    return NextResponse.redirect(`${baseUrl}?dropbox_connected=true`);
  } catch (err) {
    console.error("Dropbox OAuth error:", err);
    return NextResponse.redirect(`${baseUrl}?dropbox_error=token_exchange_failed`);
  }
}
