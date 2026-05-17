/**
 * Admin auth - single-operator (Abdullah) internal dashboard.
 * Styled login page -> /api/admin/login verifies env creds and sets a
 * signed, httpOnly session cookie. Server components call requireAdmin().
 *
 * Crypto stays in Node (route handlers + server components), never in edge
 * middleware - middleware only does the subdomain rewrite. Env:
 *   ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "cc_admin";
const TTL_MS = 1000 * 60 * 60 * 12; // 12h session

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET missing or too short (>=16 chars)");
  }
  return s;
}

function sign(payloadB64: string): string {
  return b64url(createHmac("sha256", secret()).update(payloadB64).digest());
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** True only if username+password exactly match the configured env creds. */
export function credentialsValid(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME ?? "";
  const p = process.env.ADMIN_PASSWORD ?? "";
  if (!u || !p) return false;
  // Constant-time-ish: compare both even if the first fails.
  const uOk = safeEqual(username, u);
  const pOk = safeEqual(password, p);
  return uOk && pOk;
}

export function createSessionToken(username: string): string {
  const payload = b64url(JSON.stringify({ u: username, exp: Date.now() + TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    ) as { exp?: number };
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

/** Server-component guard. Redirects to the login page if not authed. */
export async function requireAdmin(): Promise<void> {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }
}
