"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(data.error ?? "Sign-in failed");
        setStatus("idle");
      }
    } catch {
      setError("Network error - please try again");
      setStatus("idle");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-100/40 via-white to-purple-50/40 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-ink-100 bg-white p-8 shadow-[0_12px_40px_rgba(167,92,255,0.10)]">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-[-0.02em] text-navy-900">
            Clini<span className="text-purple-600">Click</span>
          </span>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
            Admin
          </span>
        </div>
        <h1 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-navy-900">
          Sign in
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Internal dashboard. Authorised access only.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="text"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder-ink-400 focus:border-purple-400 focus:outline-none"
          />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder-ink-400 focus:border-purple-400 focus:outline-none"
          />
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
          >
            {status === "submitting" ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
