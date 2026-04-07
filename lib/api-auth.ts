import { NextRequest, NextResponse } from "next/server";

export function validateApiKey(request: NextRequest): NextResponse | null {
  const apiKey = process.env.DILLINGER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API not configured. Set DILLINGER_API_KEY environment variable." },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing Authorization header. Use: Bearer <api-key>" },
      { status: 401 }
    );
  }

  const token = auth.slice(7);
  if (token !== apiKey) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
  }

  return null;
}
