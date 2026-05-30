/**
 * One-shot setup: point the Telegram bot at the deployed Vercel webhook.
 *
 * Telegram bots can be in two modes: polling (bot fetches updates via
 * getUpdates) or webhook (Telegram POSTs to a URL you specify). We use
 * webhook so the cliniclick.ae Vercel deploy receives button taps
 * directly with no laptop dependency.
 *
 * Call once after the FIRST deploy that includes
 * src/app/api/telegram-webhook/[secret]/route.ts. Re-run only if:
 *   - The deployed domain changes
 *   - TELEGRAM_WEBHOOK_SECRET is rotated
 *   - You want to verify what's currently registered
 *
 * Usage:
 *   npx tsx agents/register-telegram-webhook.ts
 *
 * Reads from .env:
 *   TELEGRAM_BOT_TOKEN       - the bot's token from @BotFather
 *   TELEGRAM_WEBHOOK_SECRET  - your 32-char shared secret
 *   WEBHOOK_BASE_URL         - optional override; default is the production
 *                              cliniclick.ae domain. Set to e.g.
 *                              https://cliniclick-git-feat-x.vercel.app to
 *                              point a bot at a preview deploy for testing.
 */
import "dotenv/config";
import { setWebhook } from "./lib/telegram.js";

async function getWebhookInfo(): Promise<unknown> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");
  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  if (!res.ok) {
    throw new Error(`getWebhookInfo failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json() as { result: unknown }).result;
}

async function main(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN missing. Add it to .env.");
    process.exit(1);
  }
  if (!secret) {
    console.error(
      "TELEGRAM_WEBHOOK_SECRET missing. Generate a random 32-char hex and add it to BOTH .env and your Vercel project env vars."
    );
    process.exit(1);
  }
  if (secret.length < 16) {
    console.error(
      "TELEGRAM_WEBHOOK_SECRET too short. Telegram requires 1-256 chars; use 32+ for real security."
    );
    process.exit(1);
  }

  const base =
    process.env.WEBHOOK_BASE_URL?.replace(/\/$/, "") ?? "https://cliniclick.ae";
  const url = `${base}/api/telegram-webhook/${secret}`;

  console.log(`Before:`, await getWebhookInfo());

  console.log(`\nRegistering webhook -> ${url}`);
  await setWebhook({ url, secretToken: secret });
  console.log(`Registered.`);

  console.log(`\nAfter:`, await getWebhookInfo());
  console.log(
    `\nTest: tap a button on a recent draft / IG message in Telegram. The webhook should respond and edit the message.`
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
