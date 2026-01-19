import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Dropbox } from "dropbox";

export async function GET() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("dropbox_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ connected: false });
  }

  try {
    const { access_token } = JSON.parse(tokenCookie);

    const dbx = new Dropbox({ accessToken: access_token });
    const account = await dbx.usersGetCurrentAccount();

    return NextResponse.json({
      connected: true,
      user: {
        name: account.result.name.display_name,
        email: account.result.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ connected: false });
  }
}
