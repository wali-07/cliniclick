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

const VERCEL_API = "https://api.vercel.com";

/** GitHub URL for a branch's tree - always resolves (for the repo owner), so
 *  it's a safe fallback when we can't get a live Vercel preview URL. */
function githubBranchUrl(branch: string): string {
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/${branch}`;
}

/**
 * Resolve the WORKING Vercel preview URL for a branch.
 *
 * We used to construct `<project>-git-<branch>-<scope>.vercel.app` by hand,
 * but that string is unreliable: once the hostname's first DNS label exceeds
 * 63 characters (which most `editorial/<slug>` branches do), Vercel truncates
 * the branch portion and inserts a hash we cannot predict - so the predicted
 * URL simply does not resolve. The scope was also hard-coded wrongly.
 *
 * Instead we ask the Vercel API for the latest deployment of this branch and
 * return its immutable deployment URL (`<project>-<hash>-<scope>.vercel.app`),
 * which always resolves. Requires VERCEL_TOKEN (+ VERCEL_TEAM_ID for
 * team-scoped projects); VERCEL_PROJECT defaults to the repo name.
 *
 * When the token is missing, or no deployment has registered yet, we fall
 * back to the GitHub branch URL - which always resolves - so an approval
 * message never carries a dead link.
 */
export async function vercelPreviewUrl(branch: string): Promise<string> {
  const vtoken = process.env.VERCEL_TOKEN;
  if (!vtoken) return githubBranchUrl(branch);

  const project = process.env.VERCEL_PROJECT ?? REPO_NAME;
  const params = new URLSearchParams({ app: project, limit: "30" });
  const teamId = process.env.VERCEL_TEAM_ID;
  if (teamId) params.set("teamId", teamId);

  // The deployment record appears within a few seconds of the push; retry
  // briefly to cover the race between the commit and Vercel registering it.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(`${VERCEL_API}/v6/deployments?${params}`, {
        headers: { authorization: `Bearer ${vtoken}` },
      });
      if (res.ok) {
        const data = (await res.json()) as {
          deployments: Array<{ url?: string; meta?: Record<string, string> }>;
        };
        const match = data.deployments.find(
          (d) => d.meta?.githubCommitRef === branch || d.meta?.branch === branch
        );
        if (match?.url) return `https://${match.url}`;
      }
    } catch {
      /* network blip - fall through to retry, then fallback */
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return githubBranchUrl(branch);
}
