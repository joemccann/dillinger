import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// List markdown files
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("dropbox_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { access_token } = JSON.parse(tokenCookie);
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path") || "";

    // Use direct API call instead of SDK
    const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: path || "",
        recursive: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dropbox list folder error:", errorText);
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
    }

    const data = await response.json();

    // Filter for markdown files and folders
    const items = data.entries
      .filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (entry: any) =>
          entry[".tag"] === "folder" ||
          entry.name.endsWith(".md") ||
          entry.name.endsWith(".markdown")
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((entry: any) => ({
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

    // Use direct API call instead of SDK
    const response = await fetch("https://content.dropboxapi.com/2/files/download", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Dropbox-API-Arg": JSON.stringify({ path }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dropbox download error:", errorText);
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }

    const content = await response.text();
    const apiResult = response.headers.get("dropbox-api-result");
    const metadata = apiResult ? JSON.parse(apiResult) : {};

    return NextResponse.json({
      content,
      name: metadata.name || path.split("/").pop(),
      path: metadata.path_lower || path,
    });
  } catch (error) {
    console.error("Dropbox file fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
