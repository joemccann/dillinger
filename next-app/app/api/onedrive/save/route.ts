import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("onedrive_token");

  if (!tokenCookie) return null;

  const tokens = JSON.parse(tokenCookie.value);
  return tokens.access_token;
}

export async function POST(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { name, content, folderId, fileId } = await request.json();

    const fileName = name.endsWith(".md") ? name : `${name}.md`;

    let url: string;

    if (fileId) {
      // Update existing file
      url = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`;
    } else if (folderId && folderId !== "root") {
      // Create in specific folder
      url = `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}:/${fileName}:/content`;
    } else {
      // Create in root
      url = `https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}:/content`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/plain",
      },
      body: content,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OneDrive save error:", error);
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      fileId: result.id,
      name: result.name,
    });
  } catch (error) {
    console.error("OneDrive save error:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
