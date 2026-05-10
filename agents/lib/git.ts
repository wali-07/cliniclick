/**
 * Thin wrappers around git CLI for the editorial pipeline.
 *
 * Both modes (local and GitHub Actions) use the same code path - the runner
 * has the PAT in env, and locally Abdullah uses HTTPS auth backed by the
 * Windows Credential Manager (which Git Credential Manager handles).
 *
 * For Actions runs we explicitly inject the PAT into the remote URL so push
 * works without prompting.
 */

import { execSync } from "node:child_process";

function run(cmd: string, opts: { cwd?: string; capture?: boolean } = {}): string {
  try {
    const out = execSync(cmd, {
      cwd: opts.cwd,
      stdio: opts.capture ? ["ignore", "pipe", "pipe"] : "inherit",
      encoding: "utf-8",
    });
    return typeof out === "string" ? out.trim() : "";
  } catch (err) {
    const e = err as { stderr?: Buffer | string; message?: string };
    const detail =
      typeof e.stderr === "string" ? e.stderr : e.stderr?.toString() ?? e.message ?? String(err);
    throw new Error(`git command failed: ${cmd}\n${detail}`);
  }
}

/** Throw if the working tree has uncommitted changes. */
export function requireCleanTree(): void {
  const status = run("git status --porcelain", { capture: true });
  if (status.length > 0) {
    throw new Error(
      `Working tree is dirty - commit or stash your changes before running the pipeline.\n${status}`
    );
  }
}

/**
 * Set up git so push works in GitHub Actions. Locally, Git Credential Manager
 * handles auth - we leave the remote alone in that case.
 */
export function configureForActions(): void {
  if (!process.env.GITHUB_ACTIONS) return;
  const token = process.env.GITHUB_TOKEN_FOR_PR_BOT;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN_FOR_PR_BOT is not set in GitHub Actions env. Add it as a repo secret."
    );
  }
  // Embed the PAT into the remote URL so push works without prompts.
  run(
    `git remote set-url origin https://x-access-token:${token}@github.com/wali-07/cliniclick.git`
  );
  run('git config user.name "github-actions[bot]"');
  run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
}

/** Fetch latest from origin then create + check out a branch from origin/main. */
export function createBranchFromMain(branchName: string): void {
  run("git fetch origin main");
  // -B forces re-create if branch already exists locally (e.g. retrying a draft)
  run(`git checkout -B ${branchName} origin/main`);
}

/** Stage specific files, commit, push the current branch with upstream tracking. */
export function commitAndPush(args: {
  files: string[];
  message: string;
  branchName: string;
}): { sha: string } {
  for (const file of args.files) {
    run(`git add "${file}"`);
  }
  // Use -F /dev/stdin for the message so newlines + special chars don't get
  // mangled by shell escaping. Cross-platform fallback: write to a temp file.
  const escaped = args.message.replace(/"/g, '\\"').replace(/\$/g, "\\$");
  run(`git commit -m "${escaped}"`);
  run(`git push -u origin ${args.branchName}`);
  const sha = run("git rev-parse HEAD", { capture: true });
  return { sha };
}

/** Switch back to main (so the worker leaves the local checkout clean). */
export function checkoutMain(): void {
  run("git checkout main");
}
