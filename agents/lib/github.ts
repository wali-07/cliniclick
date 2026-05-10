/**
 * Thin GitHub REST API wrapper for editorial-pipeline PR operations.
 *
 * Uses the fine-grained PAT stored in env as GITHUB_TOKEN_FOR_PR_BOT.
 * Repo is hardcoded (wali-07/cliniclick) - if we add multiple repos later,
 * lift this into config.
 */

const REPO_OWNER = "wali-07";
const REPO_NAME = "cliniclick";
const API = "https://api.github.com";

function token(): string {
  const t = process.env.GITHUB_TOKEN_FOR_PR_BOT;
  if (!t) {
    throw new Error(
      "GITHUB_TOKEN_FOR_PR_BOT is not set. Add a fine-grained PAT to your .env (and to GitHub Actions secrets for cron runs)."
    );
  }
  return t;
}

async function api<T>(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init.method ?? "GET",
    headers: {
      authorization: `Bearer ${token()}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `GitHub API ${init.method ?? "GET"} ${path} failed (${res.status}): ${body}`
    );
  }
  return (await res.json()) as T;
}

export async function openPr(args: {
  branch: string;
  title: string;
  body: string;
}): Promise<{ number: number; htmlUrl: string }> {
  const result = await api<{ number: number; html_url: string }>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/pulls`,
    {
      method: "POST",
      body: { title: args.title, head: args.branch, base: "main", body: args.body },
    }
  );
  return { number: result.number, htmlUrl: result.html_url };
}

export async function findOpenPrForBranch(branch: string): Promise<{
  number: number;
  htmlUrl: string;
} | null> {
  const list = await api<Array<{ number: number; html_url: string }>>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open&head=${REPO_OWNER}:${branch}`
  );
  if (list.length === 0) return null;
  return { number: list[0].number, htmlUrl: list[0].html_url };
}

export async function mergePr(prNumber: number): Promise<{ sha: string }> {
  // Squash merge - keeps main history clean (one commit per article shipped).
  const result = await api<{ sha: string; merged: boolean }>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${prNumber}/merge`,
    {
      method: "PUT",
      body: { merge_method: "squash" },
    }
  );
  if (!result.merged) {
    throw new Error(`PR #${prNumber} merge response was not merged: ${JSON.stringify(result)}`);
  }
  return { sha: result.sha };
}

export async function closePr(prNumber: number, reason?: string): Promise<void> {
  if (reason) {
    await api(`/repos/${REPO_OWNER}/${REPO_NAME}/issues/${prNumber}/comments`, {
      method: "POST",
      body: { body: `Closed by editorial pipeline.\n\n**Reason:** ${reason}` },
    });
  }
  await api(`/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${prNumber}`, {
    method: "PATCH",
    body: { state: "closed" },
  });
}

/**
 * Build the Vercel preview URL for a given branch. Vercel's per-branch URL
 * pattern is `<project>-git-<branch>-<team>.vercel.app`. Branch slashes get
 * converted to hyphens. Long branch names get truncated by Vercel - they
 * still resolve via the canonical URL but the prediction may not be exact;
 * we emit the canonical pattern + a fallback to the PR page.
 */
export function vercelPreviewUrl(branch: string): string {
  const slug = branch.replace(/\//g, "-").toLowerCase();
  return `https://cliniclick-git-${slug}-wali-07.vercel.app`;
}
