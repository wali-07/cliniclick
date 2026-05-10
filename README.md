# CliniClick

UAE aesthetic medicine discovery + booking platform. Phase 1 = content / SEO led launch with an AI-driven editorial production pipeline.

Mission: **"We make aesthetics easy to understand."**

## Stack

- Next.js 15 (App Router) + TypeScript strict + Tailwind v4 + Turbopack
- Content as TypeScript (`src/content/`) validated by Zod schemas
- Editorial pipeline driven by the Anthropic API (Drafter + 5 Reviewer agents)
- Telegram for draft-ready notifications
- GitHub Actions cron for scheduled article drafting
- Cloudflare Pages target for hosting (not yet connected)

## Repository layout

```
src/
  app/                       Next.js routes (App Router)
  components/                React components
  content/
    concerns/                Concern entities (Acne, Pigmentation, ...)
    treatments/              Treatment entities (Botox, Dermal fillers, ...)
    machines/                Device entities (Soprano Ice Platinum, ...)
    articles/
      concerns/[slug]/...    Articles nested under a concern
      treatments/[slug]/...  Articles nested under a treatment
      machines/[slug]/...    Articles nested under a device
      guides/...             Standalone /learn articles
      index.ts               Auto-maintained barrel of every article
  lib/
    content/                 Content loaders + Zod schemas
    seo/                     Schema.org generators
agents/                      Editorial pipeline
  prompts/                   System prompts for each agent (Drafter, Editor, Brand, Legal, Compliance, SEO QA)
  lib/                       Calendar loader, Anthropic SDK wrapper, article writer, Telegram client
  run-article.ts             Pipeline entry: pick calendar entry -> Drafter -> Reviewers -> write file -> notify
  publish-article.ts         Mark a calendar entry as published
  reject-article.ts          Mark a calendar entry as rejected with feedback (next run redrafts)
  test-telegram.ts           Smoke test: sends one message
editorial/
  calendar.yaml              Source of truth: every article past, present, future
.github/workflows/
  editorial-cron.yml         Daily scheduled run of the pipeline
```

## Local development

```
npm install
npm run dev              # http://localhost:3001
npm run typecheck        # tsc --noEmit
npm run lint             # eslint
```

## Editorial commands

| Command | What it does |
|---|---|
| `npm run draft` | Pick the next due queued calendar entry, draft + review + write the article, ping Telegram. |
| `npm run draft -- --slug=<slug>` | Force draft of a specific calendar entry. |
| `npm run draft -- --dry` | Show what the worker would do without calling the API. |
| `npm run draft -- --max-cycles=N` | Cap reviewer revision loops (default 3). |
| `npm run publish-article -- --slug=<slug>` | Flip a calendar entry from `awaiting-approval` to `published`. |
| `npm run reject-article -- --slug=<slug> --reason="..."` | Flip a calendar entry to `rejected` with feedback. The next pipeline run redrafts. |
| `npm run test-telegram` | Send one test message to confirm bot wiring. |

## Editorial pipeline flow

```
editorial/calendar.yaml (queued entry, dueDate today)
    ↓ daily cron OR manual `npm run draft`
        ↓ Drafter agent (Sonnet 4.6) - first draft from brief
            ↓ Reviewers in sequence: Editor -> Brand -> Legal -> Compliance -> SEO QA
                ↓ Any reviewer flags issues? Loop back to Drafter (max 3 cycles).
                    ↓ All PASS: write article TS file, register in index, mark calendar awaiting-approval
                        ↓ Telegram message with preview link + approve/reject commands
                            ↓ Abdullah reviews, runs publish-article OR reject-article
                                ↓ Calendar entry moves to published (or rejected -> next-run redraft)
```

Reviewer prompts encode the strategy memory rules verbatim (no clinic naming, criteria mode, neutral toward clinics, no banned words, no overstated claims, etc.). When editorial standards change, edit the relevant `agents/prompts/*.md` and push - the next run uses the new version.

## Configuration (.env)

```
ANTHROPIC_API_KEY=sk-ant-api03-...
TELEGRAM_BOT_TOKEN=<from @BotFather>
TELEGRAM_CHAT_ID=<numeric, from getUpdates>
# GITHUB_TOKEN=<for v2 PR creation, not yet wired>
```

`.env` is gitignored. For the GitHub Actions cron to work, the same three values must also be set as repository secrets (Settings -> Secrets and variables -> Actions).

## Deployment

Target: Cloudflare Pages, branch-based previews + `staging.cliniclick.ae` UAT subdomain + `cliniclick.ae` production. Connection to be set up via the Cloudflare dashboard once the first batch of articles is in.
