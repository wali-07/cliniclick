import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Email capture endpoint. Every notify-me / newsletter form on the site
 * POSTs JSON `{ email, surface }` here. We add the contact to the Resend
 * audience and log the surface for our own analytics. Single opt-in.
 */

export const runtime = "nodejs";

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const { email, surface } = (body ?? {}) as {
    email?: unknown;
    surface?: unknown;
  };
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email address" },
      { status: 400 }
    );
  }
  const surfaceTag =
    typeof surface === "string" && surface.length > 0 && surface.length < 80
      ? surface
      : "general";

  const resend = client();
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!resend || !audienceId) {
    // Resend not configured (e.g., a local run without a key) - log only so
    // forms still work in dev without breaking. Production must have keys.
    console.log(`[notify] (Resend not configured) ${email} from ${surfaceTag}`);
    return NextResponse.json({ ok: true, configured: false });
  }

  try {
    await resend.contacts.create({
      email,
      audienceId,
      // We use first_name as a temporary capture-surface tag because Resend's
      // free tier does not expose true tag fields. v2 will move surface
      // tracking to its own table; for now this lets us segment in the
      // Resend dashboard by searching first_name.
      firstName: `via:${surfaceTag}`,
      unsubscribed: false,
    });
    console.log(`[notify] Captured ${email} from ${surfaceTag}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Treat "already exists" as success - the user just resubmitted, no
    // need to surface a confusing error.
    if (/already.*exist|duplicate/i.test(message)) {
      return NextResponse.json({ ok: true, deduped: true });
    }
    console.error(`[notify] Resend error for ${email}: ${message}`);
    return NextResponse.json(
      { ok: false, error: "Could not subscribe right now - please try again" },
      { status: 502 }
    );
  }
}
