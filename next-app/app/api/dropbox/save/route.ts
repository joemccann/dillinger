import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Dropbox } from "dropbox";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("dropbox_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { path, content } = await request.json();

    if (!path || content === undefined) {
      return NextResponse.json(
        { error: "Path and content are required" },
        { status: 400 }
      );
    }

    const { access_token } = JSON.parse(tokenCookie);
    const dbx = new Dropbox({ accessToken: access_token });

    // Ensure path starts with /
    const filePath = path.startsWith("/") ? path : `/${path}`;

    const response = await dbx.filesUpload({
      path: filePath,
      contents: content,
      mode: { ".tag": "overwrite" },
    });

    return NextResponse.json({
      success: true,
      path: response.result.path_lower,
      name: response.result.name,
    });
  } catch (error) {
    console.error("Dropbox save error:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
