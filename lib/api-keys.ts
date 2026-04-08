import { createHash, randomBytes } from "node:crypto";

const KEY_PREFIX = "dk_";

export function generateApiKey(): {
  plaintext: string;
  hash: string;
  prefix: string;
} {
  const raw = randomBytes(32).toString("hex");
  const plaintext = `${KEY_PREFIX}${raw}`;
  const hash = hashApiKey(plaintext);
  const prefix = raw.slice(0, 8);
  return { plaintext, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
