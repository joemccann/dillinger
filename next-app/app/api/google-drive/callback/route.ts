export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?error=google_auth_failed", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/google-drive/callback`;

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Google token exchange failed:", errorData);
      return NextResponse.redirect(new URL("/?error=google_token_failed", request.url));
    }

    const tokens = await tokenResponse.json();

    console.log("Google Drive tokens received:", {
      has_access_token: !!tokens.access_token,
      has_refresh_token: !!tokens.refresh_token,
      expires_in: tokens.expires_in,
    });

    // Store tokens in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("google_drive_token", JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    console.log("Google Drive cookie set successfully");

    return NextResponse.redirect(new URL("/?google_connected=true", request.url));
  } catch (error) {
    console.error("Google Drive callback error:", error);
    return NextResponse.redirect(new URL("/?error=google_callback_failed", request.url));
  }
}
