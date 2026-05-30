/**
 * Telegram Bot API wrapper for the editorial pipeline.
 *
 * Two surface areas:
 *  1. One-way notifications (sendMessage, sendPhoto) - used by the local
 *     pipeline + the cron route to push updates to chat.
 *  2. Inline-button approvals (sendMessageWithButtons, editMessageText,
 *     answerCallbackQuery) - used by the Vercel cron to attach approval
 *     buttons, and by the webhook to acknowledge + edit messages after
 *     a button tap.
 *
 * MarkdownV2 escaping rules apply to the `text` field of every message;
 * use escapeMd() for any user-supplied or dynamic text being interpolated.
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

// ---------------------------------------------------------------------------
// Inline-keyboard / approval-flow helpers
// ---------------------------------------------------------------------------

/**
 * A single inline keyboard button. `callback_data` is an arbitrary string
 * (max 64 bytes) that the bot receives back when the button is tapped.
 * We encode it as `<action>:<type>:<slug>` (e.g. "approve:article:acne-scars-
 * treatment", "posted:social:dermal-fillers-single") so the webhook can
 * parse it without needing a separate state store.
 */
export type InlineButton = {
  text: string;
  callback_data: string;
};

export type InlineKeyboard = InlineButton[][];

async function tgPost<T>(
  method: string,
  body: Record<string, unknown>
): Promise<T> {
  const token = env("TELEGRAM_BOT_TOKEN");
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");
  const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Telegram ${method} failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { ok: boolean; result: T };
  return data.result;
}

/**
 * Send a Markdown-formatted message with an inline keyboard. Returns the
 * message_id so the caller (or a later editMessageText) can target it.
 * Returns null if Telegram is not configured (cron should still proceed).
 */
export async function sendMessageWithButtons(args: {
  text: string;
  buttons: InlineKeyboard;
  disablePreview?: boolean;
}): Promise<number | null> {
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!chatId || !env("TELEGRAM_BOT_TOKEN")) return null;
  const result = await tgPost<{ message_id: number }>("sendMessage", {
    chat_id: chatId,
    text: args.text,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: args.disablePreview ?? false,
    reply_markup: { inline_keyboard: args.buttons },
  });
  return result.message_id;
}

/**
 * Send a photo (binary blob) with caption + inline keyboard. Used by the
 * social cron so Abdullah sees the actual IG asset alongside the
 * approve/skip buttons. Returns the message_id.
 */
export async function sendPhotoWithButtons(args: {
  photo: Buffer;
  filename?: string;
  caption: string;
  buttons: InlineKeyboard;
}): Promise<number | null> {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return null;

  // sendPhoto needs multipart/form-data because the photo is a blob.
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", args.caption);
  form.append("parse_mode", "MarkdownV2");
  form.append(
    "reply_markup",
    JSON.stringify({ inline_keyboard: args.buttons })
  );
  form.append(
    "photo",
    new Blob([new Uint8Array(args.photo)]),
    args.filename ?? "photo.jpg"
  );
  const res = await fetch(
    `${TELEGRAM_API}/bot${token}/sendPhoto`,
    { method: "POST", body: form }
  );
  if (!res.ok) {
    throw new Error(
      `Telegram sendPhoto failed (${res.status}): ${await res.text()}`
    );
  }
  const data = (await res.json()) as { result: { message_id: number } };
  return data.result.message_id;
}

/**
 * Edit an existing message's text + (optionally) replace its inline
 * keyboard. The webhook uses this to swap "[Approve] [Reject]" for
 * "✅ Published" after a tap so the chat is its own audit log.
 */
export async function editMessageText(args: {
  messageId: number;
  text: string;
  buttons?: InlineKeyboard;
}): Promise<void> {
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!chatId) return;
  const body: Record<string, unknown> = {
    chat_id: chatId,
    message_id: args.messageId,
    text: args.text,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: false,
  };
  if (args.buttons) {
    body.reply_markup = { inline_keyboard: args.buttons };
  } else {
    // Remove the keyboard entirely when no buttons are given - leaves a
    // plain text message marking the final state.
    body.reply_markup = { inline_keyboard: [] };
  }
  await tgPost("editMessageText", body);
}

/**
 * Edit ONLY the caption of a photo message (sendPhoto creates a message
 * whose text lives in `caption`, not `text`, so editMessageText fails on
 * those). Used for the social-cron messages after approve/skip.
 */
export async function editMessageCaption(args: {
  messageId: number;
  caption: string;
  buttons?: InlineKeyboard;
}): Promise<void> {
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!chatId) return;
  const body: Record<string, unknown> = {
    chat_id: chatId,
    message_id: args.messageId,
    caption: args.caption,
    parse_mode: "MarkdownV2",
  };
  if (args.buttons) {
    body.reply_markup = { inline_keyboard: args.buttons };
  } else {
    body.reply_markup = { inline_keyboard: [] };
  }
  await tgPost("editMessageCaption", body);
}

/**
 * Acknowledge a callback query so the spinner on the user's button stops.
 * Optional toast text appears as a transient notification on their screen.
 * Telegram requires this call within ~15 seconds of the tap.
 */
export async function answerCallbackQuery(args: {
  callbackQueryId: string;
  text?: string;
  showAlert?: boolean;
}): Promise<void> {
  await tgPost("answerCallbackQuery", {
    callback_query_id: args.callbackQueryId,
    text: args.text,
    show_alert: args.showAlert ?? false,
  });
}

/**
 * Register the public webhook URL with Telegram (one-shot setup; the
 * register script calls this). `secret_token` is sent in every callback
 * as a header so the webhook can verify the caller is Telegram, not a
 * random caller hitting the URL.
 */
export async function setWebhook(args: {
  url: string;
  secretToken: string;
}): Promise<void> {
  await tgPost("setWebhook", {
    url: args.url,
    secret_token: args.secretToken,
    allowed_updates: ["callback_query"],
  });
}

/**
 * Encode a button's callback_data field. Keeps the format consistent
 * across the cron (which creates buttons) and the webhook (which parses
 * taps). Telegram caps callback_data at 64 bytes, so slugs over ~50
 * chars need to be truncated before this is called.
 */
export function encodeCallback(args: {
  action: "approve" | "reject" | "posted" | "skip";
  type: "article" | "social";
  slug: string;
}): string {
  const data = `${args.action}:${args.type}:${args.slug}`;
  if (Buffer.byteLength(data, "utf-8") > 64) {
    throw new Error(`callback_data over 64 bytes: ${data}`);
  }
  return data;
}

export type DecodedCallback = {
  action: "approve" | "reject" | "posted" | "skip";
  type: "article" | "social";
  slug: string;
};

/** Inverse of encodeCallback. Returns null on malformed input. */
export function decodeCallback(data: string): DecodedCallback | null {
  const m = /^(approve|reject|posted|skip):(article|social):(.+)$/.exec(data);
  if (!m) return null;
  return {
    action: m[1] as DecodedCallback["action"],
    type: m[2] as DecodedCallback["type"],
    slug: m[3],
  };
}
