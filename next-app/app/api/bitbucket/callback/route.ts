import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?error=bitbucket_auth_failed", request.url));
  }

  const clientId = process.env.BITBUCKET_CLIENT_ID;
  const clientSecret = process.env.BITBUCKET_CLIENT_SECRET;

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://bitbucket.org/site/oauth2/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Bitbucket token exchange failed:", errorData);
      return NextResponse.redirect(new URL("/?error=bitbucket_token_failed", request.url));
    }

    const tokens = await tokenResponse.json();

    // Store tokens in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("bitbucket_token", JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.redirect(new URL("/?bitbucket_connected=true", request.url));
  } catch (error) {
    console.error("Bitbucket callback error:", error);
    return NextResponse.redirect(new URL("/?error=bitbucket_callback_failed", request.url));
  }
}
