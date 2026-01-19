import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("onedrive_token");

  if (!tokenCookie) return null;

  const tokens = JSON.parse(tokenCookie.value);
  return tokens.access_token;
}

// GET: List files in a folder
export async function GET(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const folderId = searchParams.get("folderId") || "root";

  try {
    const endpoint = folderId === "root"
      ? "https://graph.microsoft.com/v1.0/me/drive/root/children"
      : `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`;

    const response = await fetch(
      `${endpoint}?$filter=folder ne null or (file ne null and endswith(name, '.md'))`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("OneDrive list files error:", error);
      return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
    }

    const data = await response.json();

    const files = data.value.map((item: { id: string; name: string; folder?: object }) => ({
      id: item.id,
      name: item.name,
      isFolder: !!item.folder,
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("OneDrive files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

// POST: Get file content
export async function POST(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { fileId } = await request.json();

    // Get file metadata first
    const metaResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!metaResponse.ok) {
      return NextResponse.json({ error: "Failed to get file metadata" }, { status: 500 });
    }

    const metadata = await metaResponse.json();

    // Download file content
    const contentResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!contentResponse.ok) {
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    const content = await contentResponse.text();

    return NextResponse.json({
      name: metadata.name,
      content,
    });
  } catch (error) {
    console.error("OneDrive file content error:", error);
    return NextResponse.json({ error: "Failed to fetch file content" }, { status: 500 });
  }
}
