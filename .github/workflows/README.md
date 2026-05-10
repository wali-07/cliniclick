# GitHub Actions workflows

## Files

- **`editorial-cron.yml`** — the scheduled editorial pipeline. Fires daily at 09:00 UTC (13:00 Dubai), picks the next due queued calendar entry, runs it through Drafter → Reviewers, commits the resulting article + calendar update to `main`. Telegram notification fires from inside the pipeline.

## Required repository secrets

Add these once via **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Where it comes from |
|---|---|
| `ANTHROPIC_API_KEY` | Same value as in your local `.env`. The cron uses its own copy because Actions can't read your local file. |
| `TELEGRAM_BOT_TOKEN` | Same as `.env`. |
| `TELEGRAM_CHAT_ID` | Same as `.env` (the numeric chat ID, not the bot username). |

The built-in `GITHUB_TOKEN` (for committing back to main) is provided automatically by Actions — no manual setup needed.

## Manual run

Go to **Actions → Editorial cron → Run workflow**. Optional: provide a `slug` input to force a specific calendar entry instead of the auto-pick.

## Disabling temporarily

Either:
- Comment out the `schedule:` block in `editorial-cron.yml` and push, OR
- Disable the workflow in the Actions UI (**...** → Disable workflow)

## Cost

Each run that produces a draft costs ~$1-2 in Anthropic API usage. Days with no queued entry due cost nothing (just a few seconds of Actions runtime, well within the free tier).
