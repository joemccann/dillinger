export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppUrl } from "@/lib/env";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = getAppUrl();

  if (error) {
    return NextResponse.redirect(`${baseUrl}?github_error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}?github_error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        `${baseUrl}?github_error=${tokenData.error}`
      );
    }

    // Store token in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("github_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.redirect(`${baseUrl}?github_connected=true`);
  } catch {
    return NextResponse.redirect(`${baseUrl}?github_error=token_exchange_failed`);
  }
}
