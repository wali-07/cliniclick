/**
 * GitHub Trees + Refs API wrapper for the editorial pipeline's
 * serverless paths (Vercel cron + Telegram webhook).
 *
 * The existing agents/lib/git.ts uses git CLI via execSync, which is fine
 * locally but doesn't work in a serverless function (no git binary, no
 * filesystem). This module replaces those ops with REST calls so the same
 * pipeline can run from a Vercel function.
 *
 * Auth: same env var as agents/lib/github.ts (GITHUB_TOKEN_FOR_PR_BOT),
 * so locally and serverless can share one fine-grained PAT.
 *
 * Repo: hardcoded to wali-07/cliniclick. If we add more repos later, lift
 * this into config.
 */
import { Buffer } from "node:buffer";

const REPO_OWNER = "wali-07";
const REPO_NAME = "cliniclick";
const API = "https://api.github.com";

function token(): string {
  const t = process.env.GITHUB_TOKEN_FOR_PR_BOT;
  if (!t) {
    throw new Error(
      "GITHUB_TOKEN_FOR_PR_BOT is not set. Required in serverless env."
    );
  }
  return t;
}

async function ghFetch<T>(
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
      `GitHub ${init.method ?? "GET"} ${path} failed (${res.status}): ${body}`
    );
  }
  return (await res.json()) as T;
}

/**
 * Read a file from the repo at a specific ref (branch name or commit SHA).
 * Returns the decoded content (UTF-8 string) and the blob's SHA. Throws if
 * the file doesn't exist.
 */
export async function getFileContent(args: {
  path: string;
  ref?: string;
}): Promise<{ content: string; sha: string }> {
  const q = args.ref ? `?ref=${encodeURIComponent(args.ref)}` : "";
  const res = await ghFetch<{ content: string; encoding: string; sha: string }>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(args.path).replace(/%2F/g, "/")}${q}`
  );
  if (res.encoding !== "base64") {
    throw new Error(`Unexpected encoding ${res.encoding} for ${args.path}`);
  }
  const content = Buffer.from(res.content, "base64").toString("utf-8");
  return { content, sha: res.sha };
}

/**
 * Resolve a branch's current commit SHA (HEAD of the ref).
 */
export async function getBranchHead(branch: string): Promise<string> {
  const res = await ghFetch<{ object: { sha: string; type: string } }>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${encodeURIComponent(branch)}`
  );
  return res.object.sha;
}

/**
 * Create a new branch starting from the current main HEAD. Idempotent:
 * if the branch already exists, returns its existing head SHA without
 * erroring (useful when retrying a failed pipeline run).
 */
export async function createBranchFromMain(
  branch: string
): Promise<{ sha: string; created: boolean }> {
  const mainSha = await getBranchHead("main");
  try {
    await ghFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`, {
      method: "POST",
      body: { ref: `refs/heads/${branch}`, sha: mainSha },
    });
    return { sha: mainSha, created: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Reference already exists")) {
      const existing = await getBranchHead(branch);
      return { sha: existing, created: false };
    }
    throw err;
  }
}

/**
 * One file in a commit. `content` can be a UTF-8 string or a Buffer for
 * binary blobs (e.g. .webp heroes). Path is forward-slash, repo-relative
 * (e.g. "src/content/articles/index.ts").
 */
export type FileChange = {
  path: string;
  content: string | Buffer;
};

/**
 * Commit multiple files to a branch in ONE commit via the Trees API.
 *
 * Steps: create blobs for each file -> create tree with base_tree =
 * branch's current tree -> create commit -> update branch ref.
 *
 * Returns the new commit SHA. Idempotent in the sense that re-committing
 * the same content produces a no-op tree (same tree SHA), but a fresh
 * commit is still made (parent advances). Callers should dedupe upstream
 * if that matters.
 */
export async function commitFilesToBranch(args: {
  branch: string;
  files: FileChange[];
  message: string;
  authorName?: string;
  authorEmail?: string;
}): Promise<{ sha: string }> {
  if (args.files.length === 0) {
    throw new Error("commitFilesToBranch: no files to commit");
  }

  // 1. Resolve the branch's current commit + tree SHA.
  const parentSha = await getBranchHead(args.branch);
  const parentCommit = await ghFetch<{ tree: { sha: string } }>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/commits/${parentSha}`
  );

  // 2. Create a blob per file. Binary files use base64; text uses utf-8.
  //    Parallelised - GitHub allows ~5000 req/hr authenticated, way more
  //    than we'll ever hit in a single article commit.
  const blobs = await Promise.all(
    args.files.map(async (f) => {
      const isBuffer = Buffer.isBuffer(f.content);
      const blob = await ghFetch<{ sha: string }>(
        `/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`,
        {
          method: "POST",
          body: {
            content: isBuffer
              ? (f.content as Buffer).toString("base64")
              : (f.content as string),
            encoding: isBuffer ? "base64" : "utf-8",
          },
        }
      );
      return { path: f.path, sha: blob.sha };
    })
  );

  // 3. Create a new tree referencing the new blobs, inheriting all other
  //    files from the parent tree.
  const tree = await ghFetch<{ sha: string }>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/trees`,
    {
      method: "POST",
      body: {
        base_tree: parentCommit.tree.sha,
        tree: blobs.map((b) => ({
          path: b.path,
          mode: "100644",
          type: "blob",
          sha: b.sha,
        })),
      },
    }
  );

  // 4. Create the commit.
  const commit = await ghFetch<{ sha: string }>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/commits`,
    {
      method: "POST",
      body: {
        message: args.message,
        tree: tree.sha,
        parents: [parentSha],
        author:
          args.authorName && args.authorEmail
            ? {
                name: args.authorName,
                email: args.authorEmail,
                date: new Date().toISOString(),
              }
            : undefined,
      },
    }
  );

  // 5. Advance the branch ref.
  await ghFetch(
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${encodeURIComponent(args.branch)}`,
    {
      method: "PATCH",
      body: { sha: commit.sha, force: false },
    }
  );

  return { sha: commit.sha };
}

/**
 * Merge a branch into main via the Merges API. Uses a real merge commit
 * (not squash) - if you want squash, do that via PR + mergePr() in
 * github.ts instead. Returns the merge commit SHA, or null if there's
 * nothing to merge (already up-to-date).
 */
export async function mergeBranchIntoMain(args: {
  fromBranch: string;
  commitMessage?: string;
}): Promise<{ sha: string } | null> {
  try {
    const res = await ghFetch<{ sha: string }>(
      `/repos/${REPO_OWNER}/${REPO_NAME}/merges`,
      {
        method: "POST",
        body: {
          base: "main",
          head: args.fromBranch,
          commit_message: args.commitMessage,
        },
      }
    );
    return { sha: res.sha };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // 204 No Content -> already merged. Our ghFetch wrapper treats that
    // as an error because it expects JSON; surface as null instead.
    if (msg.includes("204") || msg.includes("Nothing to merge")) {
      return null;
    }
    throw err;
  }
}

/**
 * Delete a branch. Used to clean up preview branches after merge or
 * rejection. Idempotent: silently succeeds if the branch is already gone.
 */
export async function deleteBranch(branch: string): Promise<void> {
  try {
    await ghFetch(
      `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${encodeURIComponent(branch)}`,
      { method: "DELETE" }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Reference does not exist") || msg.includes("404")) {
      return;
    }
    throw err;
  }
}

/**
 * The canonical preview branch name for a calendar slug. Matches the
 * existing convention used by agents/run-article.ts --push mode so the
 * webhook can find branches the local CLI created and vice versa.
 */
export function previewBranchName(slug: string): string {
  return `editorial/${slug}`;
}
