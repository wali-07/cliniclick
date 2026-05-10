/**
 * Smoke test for Telegram wiring.
 *
 * Usage:
 *   npm run test-telegram
 *
 * Sends a single "hello" message to the chat configured in .env. If you see
 * it on your phone, the bot token + chat ID are good. If it errors with 401
 * the token is wrong or revoked. If 400 ("chat not found") the chat ID is
 * wrong - re-check via the getUpdates URL.
 */

import "dotenv/config";
import { sendMessage, isTelegramConfigured } from "./lib/telegram.js";

async function main() {
  if (!isTelegramConfigured()) {
    console.error(
      "Telegram not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env."
    );
    process.exit(1);
  }
  console.log("Sending test message...");
  const id = await sendMessage(
    `*CliniClick editorial pipeline*: telegram wiring confirmed at ${new Date().toISOString().slice(0, 16)}\\.`
  );
  console.log(`Done. Message id: ${id}`);
}

main().catch((err) => {
  console.error(`Failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
