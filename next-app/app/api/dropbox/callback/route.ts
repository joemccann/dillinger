import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Dropbox } from "dropbox";

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

    const dbx = new Dropbox({ clientId, clientSecret });
    const token = await dbx.auth.getAccessTokenFromCode(redirectUri, code);

    const result = token.result as any;

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
  } catch (error) {
    console.error("Dropbox OAuth error:", error);
    return NextResponse.redirect(`${baseUrl}?dropbox_error=token_exchange_failed`);
  }
}
