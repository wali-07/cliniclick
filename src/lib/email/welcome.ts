import { Resend } from "resend";

/**
 * Welcome email - sent immediately after a successful capture from any of
 * our notify-me / newsletter / quiz forms. Closes the "silent after signup"
 * loop so people know they're actually on the list.
 *
 * The email is intentionally short, friendly, no images, no marketing
 * sprawl. Brand voice: smart honest friend, not corporate. Plain HTML
 * (no React Email yet) keeps the dependency footprint flat for v1.
 */

const FROM_ADDRESS = "CliniClick <newsletter@cliniclick.ae>";
const REPLY_TO = "newsletter@cliniclick.ae";

/**
 * Build the welcome email body. Surface tag lets us tweak copy per capture
 * source later (e.g. quiz vs notify-me). For v1 the copy is generic.
 */
function buildWelcome(args: { surface: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "You're on the list";

  // Plain-text version (clients that block HTML render this; also better
  // for deliverability scoring).
  const text = [
    "Thanks for signing up. You're on the CliniClick list.",
    "",
    "We're building an honest, evidence-based guide to aesthetic medicine in the UAE. The plan:",
    "",
    "- A growing library of plain-language articles on concerns, treatments, and devices, with cited sources",
    "- A bi-weekly Brief with a short read and one practical question worth asking before your next consultation",
    "- An independent clinic directory (coming soon) you can use to compare verified providers and book in a click",
    "",
    "A few things you can read right now:",
    "",
    "- What is acne: https://cliniclick.ae/concerns/acne/what-is-acne",
    "- What is botox: https://cliniclick.ae/treatments/botox/what-is-botox",
    "- How aesthetic clinic pricing works in the UAE: https://cliniclick.ae/learn/how-aesthetic-clinic-pricing-works-in-the-uae",
    "",
    "Information only, not medical advice. We always link out to the source so you can verify.",
    "",
    "- The CliniClick team",
  ].join("\n");

  // HTML version - inline CSS, single column, no images. Designed for
  // Gmail / Apple Mail / Outlook web. Width capped at 560px for readability.
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d2128;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e3e6ea;">
        <tr>
          <td style="padding:32px 32px 16px 32px;">
            <a href="https://cliniclick.ae" style="display:inline-block;text-decoration:none;font-size:24px;line-height:1;font-weight:600;letter-spacing:-0.01em;color:#001435;">Clini<span style="color:#A75CFF;">Click</span></a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;">
            <h1 style="margin:8px 0 16px 0;font-size:28px;line-height:1.2;letter-spacing:-0.01em;font-weight:600;color:#001435;">You're on the list</h1>
            <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#4f5258;">Thanks for signing up. We're building an honest, evidence-based guide to aesthetic medicine in the UAE. Here's what's coming:</p>
            <ul style="margin:0 0 24px 0;padding:0 0 0 20px;font-size:16px;line-height:1.6;color:#4f5258;">
              <li style="margin-bottom:8px;">A growing library of plain-language articles on concerns, treatments, and devices, with cited sources</li>
              <li style="margin-bottom:8px;">A bi-weekly Brief with a short read and one practical question worth asking before your next consultation</li>
              <li style="margin-bottom:8px;">An independent clinic directory (coming soon) you can use to compare verified providers and book in a click</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 8px 32px;">
            <p style="margin:0 0 12px 0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;color:#6d2dbf;">A few things to read right now</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:14px 16px;border:1px solid #e3e6ea;border-radius:12px;">
                  <a href="https://cliniclick.ae/concerns/acne/what-is-acne" style="color:#001435;text-decoration:none;font-size:15px;font-weight:600;line-height:1.4;">What is acne &rarr;</a>
                  <p style="margin:4px 0 0 0;font-size:14px;line-height:1.5;color:#6d6e70;">First-principles explainer. What is happening on your skin and how to think about your options.</p>
                </td>
              </tr>
              <tr><td style="height:8px;"></td></tr>
              <tr>
                <td style="padding:14px 16px;border:1px solid #e3e6ea;border-radius:12px;">
                  <a href="https://cliniclick.ae/treatments/botox/what-is-botox" style="color:#001435;text-decoration:none;font-size:15px;font-weight:600;line-height:1.4;">What is botox &rarr;</a>
                  <p style="margin:4px 0 0 0;font-size:14px;line-height:1.5;color:#6d6e70;">How it works, what it actually treats, what it costs in the UAE, what to ask in your consultation.</p>
                </td>
              </tr>
              <tr><td style="height:8px;"></td></tr>
              <tr>
                <td style="padding:14px 16px;border:1px solid #e3e6ea;border-radius:12px;">
                  <a href="https://cliniclick.ae/learn/how-aesthetic-clinic-pricing-works-in-the-uae" style="color:#001435;text-decoration:none;font-size:15px;font-weight:600;line-height:1.4;">How aesthetic clinic pricing works in the UAE &rarr;</a>
                  <p style="margin:4px 0 0 0;font-size:14px;line-height:1.5;color:#6d6e70;">What is actually inside a treatment price, and how to interrogate any quote.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 32px 32px;border-top:1px solid #e3e6ea;">
            <p style="margin:16px 0 8px 0;font-size:13px;line-height:1.5;color:#6d6e70;">Information only, not medical advice. We always link out to the source so you can verify.</p>
            <p style="margin:16px 0 0 0;font-size:13px;color:#6d6e70;">- The CliniClick team</p>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0 0;font-size:12px;color:#9aa1ac;text-align:center;">You're receiving this because you signed up at cliniclick.ae (surface: ${escapeHtml(args.surface)}).</p>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Send the welcome email via Resend. Returns the message id on success,
 * null if Resend is not configured. Errors are caught and logged but do
 * NOT fail the parent capture - getting on the list is the primary goal;
 * the welcome email is best-effort.
 */
export async function sendWelcomeEmail(args: {
  to: string;
  surface: string;
}): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  const resend = new Resend(apiKey);
  const { subject, html, text } = buildWelcome({ surface: args.surface });
  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: args.to,
      subject,
      html,
      text,
      replyTo: REPLY_TO,
      headers: {
        // Hint to Gmail / Outlook that this is a single-recipient
        // transactional email, not a bulk newsletter blast.
        "X-Entity-Ref-ID": `welcome-${args.surface}-${Date.now()}`,
      },
    });
    if (result.error) {
      console.error("[welcome-email] Resend error:", result.error);
      return null;
    }
    return result.data?.id ?? null;
  } catch (err) {
    console.error(
      "[welcome-email] send failed:",
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}
