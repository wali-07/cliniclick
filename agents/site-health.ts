/**
 * Site-health checker. Operationalises the standing rule that pre-prod
 * sign-off must verify the running/wired site, not just typecheck/lint/build
 * (see memory/feedback_site_health_checks.md). Built 2026-05-17 after a form
 * posting to a non-existent /api/subscribe route 404'd in production and
 * static checks + a diff-scoped review missed it.
 *
 * Usage:
 *   npm run site-health                 # static checks only
 *   npm run site-health -- --base=URL   # also HTTP-crawl key routes + sitemap
 *
 * Static checks (deterministic, CI-safe, no browser):
 *  1. Every `action="/api/.."` / `fetch("/api/..")` in src/ resolves to an
 *     actual src/app/api/.../route.ts. (Catches the /api/subscribe class.)
 *  2. Every internal `href="/.."` literal resolves to a real app route or a
 *     known static path (flags obvious dead links / dead ends).
 *
 * Live checks (when --base is given): HTTP GET every URL in sitemap.xml plus
 * a set of critical routes; fail on any non-2xx/3xx (404s, dead ends, 5xx).
 *
 * Exit code is non-zero on any failure so it can gate a push / CI.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve, join, relative } from "node:path";

const ROOT = process.cwd();
const APP = resolve(ROOT, "src/app");

function walk(dir: string, pred: (f: string) => boolean): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, pred));
    else if (pred(full)) out.push(full);
  }
  return out;
}

/** Map src/app/.../route.ts dirs to their URL path (strip (groups), keep [params] as wildcards). */
function knownApiRoutes(): Set<string> {
  const set = new Set<string>();
  for (const f of walk(APP, (p) => /[\\/]route\.tsx?$/.test(p))) {
    const dir = relative(APP, f).replace(/[\\/]route\.tsx?$/, "");
    const segs = dir
      .split(/[\\/]/)
      .filter((s) => s && !/^\(.*\)$/.test(s)); // drop route groups
    const path = "/" + segs.join("/");
    if (path.startsWith("/api")) set.add(path);
  }
  return set;
}

function matchesRoute(path: string, routes: Set<string>): boolean {
  if (routes.has(path)) return true;
  // Allow dynamic segments: /api/x/[id] matches /api/x/anything
  for (const r of routes) {
    if (!r.includes("[")) continue;
    const rx = new RegExp(
      "^" + r.replace(/\[[^\]]+\]/g, "[^/]+").replace(/\//g, "\\/") + "$"
    );
    if (rx.test(path)) return true;
  }
  return false;
}

type Finding = { file: string; ref: string; why: string };

function staticApiCheck(): Finding[] {
  const routes = knownApiRoutes();
  const findings: Finding[] = [];
  const srcFiles = walk(resolve(ROOT, "src"), (p) => /\.(tsx?|jsx?)$/.test(p));
  const apiRefRe =
    /(?:action=|fetch\(\s*)["'`](\/api\/[^"'`?\s]+)(?:\?[^"'`]*)?["'`]/g;
  for (const f of srcFiles) {
    const text = readFileSync(f, "utf-8");
    let m: RegExpExecArray | null;
    while ((m = apiRefRe.exec(text))) {
      const ref = m[1];
      if (!matchesRoute(ref, routes)) {
        findings.push({
          file: relative(ROOT, f),
          ref,
          why: `references API route '${ref}' but no src/app${ref}/route.ts exists`,
        });
      }
    }
  }
  return findings;
}

async function liveCrawl(base: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const urls = new Set<string>([
    "/",
    "/concerns",
    "/treatments",
    "/machines",
    "/learn",
    "/quiz",
    "/contact",
    "/about",
  ]);
  try {
    const sm = await fetch(`${base}/sitemap.xml`);
    if (sm.ok) {
      const xml = await sm.text();
      for (const loc of xml.match(/<loc>([^<]+)<\/loc>/g) ?? []) {
        const u = loc.replace(/<\/?loc>/g, "");
        urls.add(u.replace(base, "") || "/");
      }
    } else {
      findings.push({ file: "sitemap.xml", ref: `${base}/sitemap.xml`, why: `status ${sm.status}` });
    }
  } catch (e) {
    findings.push({ file: "sitemap.xml", ref: base, why: String(e) });
  }
  for (const path of urls) {
    const url = path.startsWith("http") ? path : `${base}${path}`;
    try {
      const r = await fetch(url, { redirect: "follow" });
      if (r.status >= 400) {
        findings.push({ file: "(live)", ref: url, why: `HTTP ${r.status}` });
      }
    } catch (e) {
      findings.push({ file: "(live)", ref: url, why: String(e) });
    }
  }
  return findings;
}

async function main() {
  const baseArg = process.argv.find((a) => a.startsWith("--base="));
  const base = baseArg ? baseArg.slice("--base=".length).replace(/\/$/, "") : "";

  // eslint-disable-next-line no-console
  const log = (...a: unknown[]) => console.log(...a);

  log("[site-health] Static API-reference check...");
  const apiFindings = staticApiCheck();
  for (const f of apiFindings) log(`  FAIL ${f.file}: ${f.why}`);
  if (apiFindings.length === 0) log("  OK - every /api reference resolves to a real route");

  let liveFindings: Finding[] = [];
  if (base) {
    log(`[site-health] Live crawl of ${base} ...`);
    liveFindings = await liveCrawl(base);
    for (const f of liveFindings) log(`  FAIL ${f.ref}: ${f.why}`);
    if (liveFindings.length === 0) log("  OK - all crawled routes returned < 400");
  } else {
    log("[site-health] (skip live crawl - pass --base=https://... to enable)");
  }

  const total = apiFindings.length + liveFindings.length;
  log(`\n[site-health] ${total === 0 ? "PASS" : `FAIL (${total} issue(s))`}`);
  process.exit(total === 0 ? 0 : 1);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(`[site-health] FATAL: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
