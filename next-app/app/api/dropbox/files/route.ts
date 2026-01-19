import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Dropbox } from "dropbox";

// List markdown files
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("dropbox_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { access_token } = JSON.parse(tokenCookie);
    const dbx = new Dropbox({ accessToken: access_token });

    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path") || "";

    const response = await dbx.filesListFolder({
      path: path || "",
      recursive: false,
    });

    // Filter for markdown files and folders
    const items = response.result.entries
      .filter(
        (entry) =>
          entry[".tag"] === "folder" ||
          entry.name.endsWith(".md") ||
          entry.name.endsWith(".markdown")
      )
      .map((entry) => ({
        name: entry.name,
        path: entry.path_lower,
        isFolder: entry[".tag"] === "folder",
      }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Dropbox files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

// Fetch file content
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("dropbox_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { path } = await request.json();
    const { access_token } = JSON.parse(tokenCookie);
    const dbx = new Dropbox({ accessToken: access_token });

    const response = await dbx.filesDownload({ path });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = response.result as Record<string, any>;

    // Get file content from the blob
    const content = await (result.fileBlob as Blob).text();

    return NextResponse.json({
      content,
      name: result.name,
      path: result.path_lower,
    });
  } catch (error) {
    console.error("Dropbox file fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
