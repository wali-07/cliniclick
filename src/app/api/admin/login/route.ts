import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSessionToken,
  credentialsValid,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const { username, password } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
  };
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ ok: false, error: "Missing credentials" }, { status: 400 });
  }
  if (!credentialsValid(username, password)) {
    return NextResponse.json(
      { ok: false, error: "Incorrect username or password" },
      { status: 401 }
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(username), {
    httpOnly: true,
    // Secure in production (Vercel = HTTPS). Off locally so the cookie is
    // stored over http://admin.localhost during local testing.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
