"use client";

/**
 * Newsletter capture for "The CliniClick Brief" (bi-weekly).
 * Used on home, hubs, coming-soon pages, and the bottom of guide articles.
 *
 * Submits JSON to /api/notify (the real endpoint) via fetch and shows an
 * inline success/error state. Previously this posted a native HTML form to
 * /api/subscribe, which does not exist - every signup 404'd. Fixed 2026-05-17.
 */

import { useState } from "react";

type Status = "idle" | "submitting" | "ok" | "error";

export function NewsletterSignup({
  surface = "general",
  variant = "card",
}: {
  surface?: string;
  variant?: "card" | "inline";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, surface }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setStatus("ok");
        setMessage("You're on the list. Check your inbox.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong - please try again");
      }
    } catch {
      setStatus("error");
      setMessage("Network error - please try again");
    }
  }

  if (variant === "inline") {
    return (
      <form
        onSubmit={submit}
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        data-capture-surface={surface}
      >
        <label htmlFor={`brief-email-${surface}`} className="sr-only">
          Your email
        </label>
        <input
          id={`brief-email-${surface}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "ok"}
          className="flex-1 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm text-ink-900 placeholder-ink-400 focus:border-purple-400 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting" || status === "ok"}
          className="rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {status === "submitting"
            ? "..."
            : status === "ok"
            ? "Subscribed"
            : "Subscribe"}
        </button>
        {message && (
          <p
            role="status"
            className={`sm:basis-full text-xs ${
              status === "error" ? "text-red-600" : "text-purple-700"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    );
  }
  return (
    <section
      className="rounded-3xl bg-navy-900 p-8 text-white sm:p-12"
      aria-labelledby="brief-heading"
      data-capture-surface={surface}
    >
      <p className="eyebrow text-purple-300">The CliniClick Brief</p>
      <h2
        id="brief-heading"
        className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        Honest aesthetic explainers, every two weeks
      </h2>
      <p className="mt-3 max-w-xl text-sm text-navy-100/80 sm:text-base">
        One short read. One piece of marketing language explained. One practical
        question to ask at your next consultation. No fluff, no hype.
      </p>
      <form
        onSubmit={submit}
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
        <label htmlFor={`brief-email-card-${surface}`} className="sr-only">
          Your email
        </label>
        <input
          id={`brief-email-card-${surface}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "ok"}
          className="flex-1 rounded-full border border-navy-700 bg-navy-800 px-5 py-3 text-sm text-white placeholder-navy-100/60 focus:border-purple-400 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting" || status === "ok"}
          className="rounded-full bg-purple-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-400 disabled:opacity-60"
        >
          {status === "submitting"
            ? "..."
            : status === "ok"
            ? "Subscribed"
            : "Subscribe"}
        </button>
      </form>
      <p
        role="status"
        className={`mt-3 text-xs ${
          status === "error" ? "text-red-300" : "text-navy-100/60"
        }`}
      >
        {message || "Free. Unsubscribe anytime. Your email stays with us only."}
      </p>
    </section>
  );
}
