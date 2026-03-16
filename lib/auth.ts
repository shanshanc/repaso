import { NextRequest } from "next/server";

export const COOKIE_NAME = "repaso-auth";
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function computeToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("repaso-authenticated")
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyAuth(request: NextRequest): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return true; // dev: no auth configured, open access

  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie) return false;

  const expected = await computeToken(secret);
  return cookie.value === expected;
}
