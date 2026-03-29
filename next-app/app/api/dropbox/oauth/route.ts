export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { DropboxAuth } from "dropbox";
import { getAppUrl } from "@/lib/env";

export async function GET() {
  const clientId = process.env.DROPBOX_APP_KEY;
  const baseUrl = getAppUrl();

  if (!clientId) {
    return NextResponse.json(
      { error: "Dropbox OAuth not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${baseUrl}/api/dropbox/callback`;

  const dbxAuth = new DropboxAuth({ clientId });
  const authUrl = await dbxAuth.getAuthenticationUrl(
    redirectUri,
    undefined,
    "code",
    "offline",
    undefined,
    undefined,
    false
  );

  return NextResponse.redirect(authUrl.toString());
}
