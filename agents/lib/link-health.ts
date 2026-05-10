/**
 * Link Health Agent - validates URLs in a generated article and tries to
 * auto-fix broken ones before the article is reviewed and published.
 *
 * What it checks:
 *  - Every URL in the article's `sources` array (external citations).
 *  - Every internal markdown link `[text](/path)` in paragraph block text.
 *
 * What it does:
 *  - For broken external sources: tries the Wayback Machine for an archived
 *    version. If found, rewrites the URL to the Wayback snapshot. If no
 *    snapshot exists, returns the source as a hard failure - publish blocked.
 *  - For broken internal links: removes the markdown link wrapper, leaving
 *    the link text as plain text. (Internal slugs change; better to lose
 *    the link than ship a 404.)
 *
 * Used as a pre-reviewer step in agents/run-article.ts. Reviewers see the
 * already-cleaned article so they don't waste cycles flagging dead links.
 */

const TIMEOUT_MS = 8000;
const WAYBACK_API = "https://archive.org/wayback/available";

type CheckResult =
  | { ok: true }
  | { ok: false; status?: number; error?: string };

async function fetchWithTimeout(url: string, opts: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * HEAD request first, fall back to GET if HEAD is not allowed (some servers
 * return 405 for HEAD even when GET is fine).
 */
export async function checkUrl(url: string): Promise<CheckResult> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetchWithTimeout(url, {
        method,
        redirect: "follow",
        headers: {
          // Some sites block default fetch UA - present as a real browser.
          "user-agent":
            "Mozilla/5.0 CliniClick-LinkHealth/1.0 (+https://cliniclick.ae)",
        },
      });
      if (res.ok) return { ok: true };
      // 405 on HEAD - retry as GET; everything else is a real failure.
      if (method === "HEAD" && res.status === 405) continue;
      return { ok: false, status: res.status };
    } catch (err) {
      if (method === "HEAD") continue;
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
  return { ok: false, error: "all methods failed" };
}

/**
 * Ask the Wayback Machine for the closest archived snapshot of a URL.
 * Returns the snapshot URL if one exists, null otherwise.
 */
export async function findWaybackSnapshot(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`${WAYBACK_API}?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      archived_snapshots?: { closest?: { available?: boolean; url?: string } };
    };
    const snap = data.archived_snapshots?.closest;
    if (snap?.available && snap.url) return snap.url;
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Article-level operations: parse the generated TS file, validate, rewrite
// ---------------------------------------------------------------------------

/**
 * A side-effect log of what the link-health pass did, surfaced to the worker
 * so it can include the report in the run log.
 */
export type LinkHealthReport = {
  externalChecked: number;
  externalRewritten: { original: string; replacement: string }[];
  externalUnfixable: { url: string; status?: number; error?: string }[];
  internalRemoved: { path: string }[];
};

/**
 * Extract every `url: "..."` field that appears under a sources entry.
 * The Drafter outputs sources as an array of objects each with a url string;
 * we don't try to parse the TS source AST - a regex over the file body
 * is sufficient because the structure is highly constrained.
 */
function extractSourceUrls(tsContent: string): string[] {
  const urls: string[] = [];
  const re = /url:\s*"((?:https?:\/\/)[^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(tsContent)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

/**
 * Replace one URL with another inside the source TS, scoped to the `url:`
 * field assignments. We don't want to accidentally match the same URL inside
 * paragraph body text.
 */
function rewriteSourceUrl(
  tsContent: string,
  from: string,
  to: string
): string {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(url:\\s*")${escaped}(")`, "g");
  return tsContent.replace(re, `$1${to}$2`);
}

/**
 * Find every internal markdown link `[text](/path)` inside paragraph text
 * blocks. Returns the path strings (deduplicated).
 */
function extractInternalLinkPaths(tsContent: string): string[] {
  const paths = new Set<string>();
  // text: "..." can contain internal links - capture each [..](/...) pair.
  const linkRe = /\[[^\]]+\]\((\/[^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(tsContent)) !== null) {
    paths.add(match[1]);
  }
  return [...paths];
}

/**
 * Remove a `[text](/path)` markdown link, leaving the text as plain content.
 * Scoped so we only touch internal-path links (start with `/`), never
 * external sources.
 */
function removeInternalLink(tsContent: string, path: string): string {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\[([^\\]]+)\\]\\(${escaped}\\)`, "g");
  return tsContent.replace(re, "$1");
}

/**
 * The list of internal route prefixes the article system can resolve.
 * Used to decide whether a `/some/path` link is broken without a real HTTP
 * check (those are often skipped on local runs - we just confirm the
 * route shape is one we serve).
 */
const KNOWN_INTERNAL_PREFIXES = [
  "/concerns/",
  "/treatments/",
  "/machines/",
  "/learn/",
  "/about",
  "/editorial-policy",
  "/how-we-write-our-content",
  "/glossary",
  "/quiz",
  "/contact",
  "/privacy",
  "/terms",
];

function looksLikeKnownInternalPath(path: string): boolean {
  return KNOWN_INTERNAL_PREFIXES.some((p) =>
    p.endsWith("/") ? path.startsWith(p) : path === p
  );
}

/**
 * Validate every external source URL in the article. For broken ones, try
 * Wayback. Rewrite the TS source in-place (returned as a new string).
 *
 * For internal markdown links, just check the path matches a known route
 * prefix. If it doesn't, strip the link wrapper - the prose stays, the link
 * disappears.
 *
 * Returns the cleaned content + a structured report for logging.
 */
export async function runLinkHealth(
  tsContent: string
): Promise<{ content: string; report: LinkHealthReport; blocking: boolean }> {
  let working = tsContent;
  const report: LinkHealthReport = {
    externalChecked: 0,
    externalRewritten: [],
    externalUnfixable: [],
    internalRemoved: [],
  };

  // ---- External sources ----
  const externalUrls = extractSourceUrls(working);
  report.externalChecked = externalUrls.length;

  // Run checks in parallel - these are independent and the slowest step.
  const checks = await Promise.all(
    externalUrls.map(async (url) => ({ url, result: await checkUrl(url) }))
  );

  for (const { url, result } of checks) {
    if (result.ok) continue;
    const wayback = await findWaybackSnapshot(url);
    if (wayback) {
      working = rewriteSourceUrl(working, url, wayback);
      report.externalRewritten.push({ original: url, replacement: wayback });
    } else {
      report.externalUnfixable.push({ url, status: result.status, error: result.error });
    }
  }

  // ---- Internal links ----
  const internalPaths = extractInternalLinkPaths(working);
  for (const path of internalPaths) {
    if (looksLikeKnownInternalPath(path)) continue;
    working = removeInternalLink(working, path);
    report.internalRemoved.push({ path });
  }

  // Blocking iff any external source could not be recovered.
  const blocking = report.externalUnfixable.length > 0;

  return { content: working, report, blocking };
}

/**
 * Format a report for human-readable logging.
 */
export function formatReport(report: LinkHealthReport): string {
  const lines: string[] = [];
  lines.push(`  external sources checked: ${report.externalChecked}`);
  if (report.externalRewritten.length > 0) {
    lines.push(`  rewrote ${report.externalRewritten.length} broken source(s) to Wayback:`);
    for (const r of report.externalRewritten) {
      lines.push(`    - ${r.original}`);
      lines.push(`      -> ${r.replacement}`);
    }
  }
  if (report.externalUnfixable.length > 0) {
    lines.push(`  UNFIXABLE external source(s):`);
    for (const u of report.externalUnfixable) {
      lines.push(`    - ${u.url}  (${u.status ?? u.error ?? "?"})`);
    }
  }
  if (report.internalRemoved.length > 0) {
    lines.push(`  removed ${report.internalRemoved.length} broken internal link(s):`);
    for (const p of report.internalRemoved) {
      lines.push(`    - ${p.path}`);
    }
  }
  return lines.join("\n");
}
