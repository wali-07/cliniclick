/**
 * Minimal Telegram Bot API wrapper for editorial-pipeline notifications.
 *
 * For v1 we only send messages - the bot is one-way (worker -> Abdullah).
 * Inline-button approvals + webhook handling come in v2 once the bot is
 * deployed as a Cloudflare Worker with a public webhook URL.
 */

const TELEGRAM_API = "https://api.telegram.org";

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

/**
 * Whether Telegram is configured. The pipeline runs fine without it - we just
 * skip notifications and log to console instead. Useful for first-time setup
 * or for runs where the bot isn't expected to fire.
 */
export function isTelegramConfigured(): boolean {
  return Boolean(env("TELEGRAM_BOT_TOKEN") && env("TELEGRAM_CHAT_ID"));
}

/**
 * Send a Markdown-formatted message to the configured chat.
 * Returns the Telegram message_id on success, or null if Telegram is not
 * configured. Throws on API errors so the caller can decide whether they
 * are a hard failure.
 */
export async function sendMessage(text: string): Promise<number | null> {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return null;

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: false,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram sendMessage failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { result: { message_id: number } };
  return data.result.message_id;
}

/**
 * MarkdownV2 reserves these characters - they MUST be escaped when used
 * literally inside a message: _ * [ ] ( ) ~ ` > # + - = | { } . !
 * Use this for any user-supplied or dynamic text being interpolated into a
 * message body. Pre-formatted markdown (bold, links) goes around the
 * already-escaped values.
 */
export function escapeMd(text: string): string {
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, (c) => `\\${c}`);
}
