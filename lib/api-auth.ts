import { NextRequest, NextResponse } from "next/server";
import { hashApiKey } from "@/lib/api-keys";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

interface AuthResult {
  error: NextResponse | null;
  headers: Record<string, string>;
}

export async function validateApiKey(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Missing Authorization header. Use: Bearer <api-key>" },
        { status: 401 }
      ),
      headers: {},
    };
  }

  const token = authHeader.slice(7);

  if (token.startsWith("dk_")) {
    return validateUserKey(token);
  }

  return validateLegacyKey(token);
}

async function validateUserKey(token: string): Promise<AuthResult> {
  const hash = hashApiKey(token);

  try {
    const key = await prisma.apiKey.findUnique({ where: { keyHash: hash } });

    if (!key || key.revokedAt) {
      return {
        error: NextResponse.json({ error: "Invalid or revoked API key" }, { status: 403 }),
        headers: {},
      };
    }

    if (key.expiresAt && key.expiresAt < new Date()) {
      return {
        error: NextResponse.json({ error: "API key has expired" }, { status: 403 }),
        headers: {},
      };
    }

    prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    const rl = await rateLimit(key.id);
    const headers = rateLimitHeaders(rl);

    if (!rl.success) {
      return {
        error: NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429, headers }
        ),
        headers,
      };
    }

    return { error: null, headers };
  } catch {
    return {
      error: NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 }),
      headers: {},
    };
  }
}

function validateLegacyKey(token: string): AuthResult {
  const apiKey = process.env.DILLINGER_API_KEY;
  if (!apiKey) {
    return {
      error: NextResponse.json(
        { error: "API not configured. Set DILLINGER_API_KEY environment variable." },
        { status: 503 }
      ),
      headers: {},
    };
  }

  if (token !== apiKey) {
    return {
      error: NextResponse.json({ error: "Invalid API key" }, { status: 403 }),
      headers: {},
    };
  }

  return {
    error: null,
    headers: { "X-API-Key-Deprecated": "Use dk_ prefixed keys. See https://dillinger.io/settings/api" },
  };
}
