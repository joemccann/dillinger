export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("google_drive_token");

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
    // Query for folders and markdown files
    const query = `'${folderId}' in parents and trashed = false and (mimeType = 'application/vnd.google-apps.folder' or name contains '.md')`;

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&orderBy=folder,name`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Google Drive list files error:", error);
      return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
    }

    const data = await response.json();

    const files = data.files.map((file: { id: string; name: string; mimeType: string }) => ({
      id: file.id,
      name: file.name,
      isFolder: file.mimeType === "application/vnd.google-apps.folder",
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Google Drive files error:", error);
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
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name`,
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
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
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
    console.error("Google Drive file content error:", error);
    return NextResponse.json({ error: "Failed to fetch file content" }, { status: 500 });
  }
}
