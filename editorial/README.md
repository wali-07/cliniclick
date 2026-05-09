# Editorial directory

This is the source of truth for the CliniClick content engine.

## Files

- **`calendar.yaml`** — every article: slug, parent, kind, due date, status, brief, keywords. The pipeline worker reads this on every run to decide what to draft. The Telegram bot updates statuses here as articles move through the lifecycle.

## How it works

```
calendar.yaml (queued entry)
    ↓ daily cron (.github/workflows/editorial-cron.yml)
        ↓ pipeline worker (agents/run-article.ts)
            ↓ Drafter -> Editor -> SEO QA -> Brand -> Legal -> Compliance
                ↓ writes article TS file to src/content/articles/<parentType>s/<parentSlug>/<slug>.ts
                    ↓ opens PR on wali-07/cliniclick
                        ↓ Telegram message: preview link + Approve / Reject buttons
                            ↓ Abdullah clicks Approve
                                ↓ Telegram bot merges PR via GitHub API
                                    ↓ status = published in calendar.yaml
                                        ↓ Cloudflare Pages auto-deploys
```

## Status lifecycle

See the comments at the top of `calendar.yaml`. Statuses progress:
`queued -> drafting -> in-review -> awaiting-approval -> approved -> published`,
with `rejected` and `skipped` as off-paths.

## Editing the calendar

Add or edit YAML directly. Commit + push. Next cron run picks up changes.
The pipeline never deletes entries — completed articles stay in the calendar
with `status: published` for the historical record.
