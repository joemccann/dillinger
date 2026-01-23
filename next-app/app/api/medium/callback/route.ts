export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?error=medium_auth_failed", request.url));
  }

  const clientId = process.env.MEDIUM_CLIENT_ID;
  const clientSecret = process.env.MEDIUM_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/medium/callback`;

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://api.medium.com/v1/tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Medium token exchange failed:", errorData);
      return NextResponse.redirect(new URL("/?error=medium_token_failed", request.url));
    }

    const tokens = await tokenResponse.json();

    // Store tokens in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("medium_token", JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_at * 1000),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.redirect(new URL("/?medium_connected=true", request.url));
  } catch (error) {
    console.error("Medium callback error:", error);
    return NextResponse.redirect(new URL("/?error=medium_callback_failed", request.url));
  }
}
