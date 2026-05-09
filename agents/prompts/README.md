# Agent prompts

System prompts for the editorial production agents. Each prompt is the full
system message passed to the Anthropic API when the pipeline worker invokes
that agent role.

## Files

- **`drafter.md`** — generates the first draft of an article from a brief in `editorial/calendar.yaml`. Outputs a complete `defineArticle({...})` TypeScript block.
- **`editor.md`** — language quality assurance. Returns `PASS` or specific line-edits.
- **`brand.md`** — voice + positioning + neutral-toward-clinics. Returns `PASS` or specific brand issues.
- **`legal.md`** — pre-publish veto power. No clinic/doctor naming, no defamation, no overstated claims, no medical advice phrasing. Returns `PASS` or `LEGAL HOLD`.
- **`compliance.md`** — DHA/MOHAP advertising compliance. No "guaranteed/cured/permanent" language, side effects + contraindications must be present, no specific dosing for prescription meds. Returns `PASS` or `COMPLIANCE HOLD`.
- **`seo-qa.md`** — title/meta length, heading structure, internal links, FAQ format, GEO-friendliness. Returns `PASS` or `SEO ISSUES`.

## Pipeline order

```
Drafter -> Editor -> Brand -> Legal -> Compliance -> SEO QA
```

If any reviewer returns issues, the worker loops back to the Drafter with the issues bundled as context. Drafter revises. Reviewers re-run on the revision. Up to 3 revision cycles per article — if it has not converged after 3, it gets flagged for Abdullah's attention as a manual review case.

## Editing prompts

Edit prompts directly. Commit + push. Next pipeline run uses the new versions.
Each prompt should reference the relevant strategy memory rules verbatim so that
strategy drift is hard to introduce silently.

## Versioning

If you make a substantive change to a prompt, note it in the commit message
("brand prompt v2: added rule about Gulf-skin region branding") so we can
correlate output quality changes to prompt changes over time.
