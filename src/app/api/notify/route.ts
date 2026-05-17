import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sendWelcomeEmail } from "@/lib/email/welcome";

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

  // Resend v6's SDK returns { data, error } and does NOT throw on API
  // errors; contacts.create is also upsert-ish (no "already exists" error),
  // so the old try/catch-on-thrown-message approach never detected dupes AND
  // silently swallowed real create failures (capture looked OK but wasn't).
  // Fix: explicitly look the contact up by email first, and inspect the
  // returned error on create. try/catch now only guards genuine network
  // exceptions.
  let isDuplicate = false;
  try {
    const existing = await resend.contacts.get({ email, audienceId });
    if (!existing.error && existing.data) {
      isDuplicate = true;
      console.log(`[notify] ${email} already in audience (re-submit from ${surfaceTag})`);
    } else {
      const created = await resend.contacts.create({
        email,
        audienceId,
        // first_name doubles as a capture-surface tag - Resend's free tier
        // has no real tag field. Segment in the dashboard by first_name.
        firstName: `via:${surfaceTag}`,
        unsubscribed: false,
      });
      if (created.error) {
        console.error(
          `[notify] Resend create error for ${email}: ${created.error.name} - ${created.error.message}`
        );
        return NextResponse.json(
          { ok: false, error: "Could not subscribe right now - please try again" },
          { status: 502 }
        );
      }
      console.log(`[notify] Captured ${email} from ${surfaceTag}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[notify] Resend network error for ${email}: ${message}`);
    return NextResponse.json(
      { ok: false, error: "Could not subscribe right now - please try again" },
      { status: 502 }
    );
  }

  // Welcome email - only send for genuinely new contacts to avoid spamming
  // someone every time they re-submit a form. Best-effort; failure here
  // does not roll back the audience add.
  if (!isDuplicate) {
    sendWelcomeEmail({ to: email, surface: surfaceTag }).then((id) => {
      if (id) console.log(`[notify] Sent welcome email to ${email} (id: ${id})`);
    });
  }

  return NextResponse.json({ ok: true, ...(isDuplicate ? { deduped: true } : {}) });
}
