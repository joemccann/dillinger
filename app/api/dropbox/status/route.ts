export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("dropbox_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ connected: false });
  }

  try {
    const { access_token } = JSON.parse(tokenCookie);

    // Use direct API call instead of SDK (SDK has fetch issues in Node.js)
    const response = await fetch("https://api.dropboxapi.com/2/users/get_current_account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ connected: false });
    }

    const account = await response.json();

    return NextResponse.json({
      connected: true,
      user: {
        name: account.name?.display_name || "Unknown",
        email: account.email || "",
      },
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
