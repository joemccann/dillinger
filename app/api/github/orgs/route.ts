export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    const [userResponse, orgsResponse] = await Promise.all([
      fetch("https://api.github.com/user", { headers }),
      fetch("https://api.github.com/user/orgs", { headers }),
    ]);

    const [user, orgs] = await Promise.all([
      userResponse.json(),
      orgsResponse.json(),
    ]);

    // Prepend user as first "org" option
    const allOrgs = [{ login: user.login, type: "user" }, ...orgs];

    return NextResponse.json(allOrgs);
  } catch (error) {
    console.error("GitHub orgs error:", error);
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}
