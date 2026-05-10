"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";

/**
 * Newsletter signup - distinct from the notify-me-when-bookings-launch
 * form (NotifyForm). This is for ongoing relationship: the bi-weekly
 * Brief. Optional first-name field for progressive profiling.
 *
 * Visually different from NotifyForm: no "Coming soon" badge, more
 * conversational copy, sized to fit homepage band + footer + article
 * end-of-content placements via the `variant` prop.
 *
 * POSTs to /api/notify with surface="newsletter:<placement>" so we can
 * distinguish brief subscribers from notify-me captures in the Resend
 * dashboard (firstName field is "via:newsletter:homepage" etc).
 */
export function NewsletterSignupForm({
  placement,
  variant = "panel",
}: {
  /** Where the form is rendered. Used for surface segmentation. */
  placement: "homepage" | "footer" | "article-end";
  /** "panel" = full headline + subhead + form. "inline" = compact form only. */
  variant?: "panel" | "inline";
}) {
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "success" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "submitting") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    if (!email) {
      setState({ kind: "error", message: "Please enter your email" });
      return;
    }
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          surface: `newsletter:${placement}`,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setState({
          kind: "error",
          message: json.error ?? "Something went wrong - please try again",
        });
        return;
      }
      setState({ kind: "success" });
      form.reset();
    } catch {
      setState({ kind: "error", message: "Network error - please try again" });
    }
  }

  if (state.kind === "success") {
    return (
      <div
        className={
          variant === "inline"
            ? "flex items-center gap-2 rounded-full border border-purple-200 bg-white px-5 py-3 text-sm font-medium text-navy-900"
            : "mx-auto flex max-w-lg items-center justify-center gap-2 rounded-full border border-purple-200 bg-white px-6 py-4 text-sm font-medium text-navy-900 shadow-[0_4px_12px_rgba(167,92,255,0.10)]"
        }
      >
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-full bg-purple-100 text-purple-700"
        >
          <Check className="h-3.5 w-3.5" />
        </span>
        Subscribed. First Brief lands in your inbox soon.
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 sm:flex-row"
        data-capture-surface={`newsletter-${placement}`}
      >
        <label htmlFor={`nl-email-${placement}`} className="sr-only">
          Your email
        </label>
        <input
          id={`nl-email-${placement}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={state.kind === "submitting"}
          className="flex-1 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm text-navy-900 placeholder-ink-400 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state.kind === "submitting"}
          className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {state.kind === "submitting" ? "..." : "Subscribe"}
        </button>
        {state.kind === "error" && (
          <p className="text-xs text-red-600 sm:basis-full">{state.message}</p>
        )}
      </form>
    );
  }

  // Full panel variant (homepage, article end).
  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 sm:flex-row"
        data-capture-surface={`newsletter-${placement}`}
      >
        <label htmlFor={`nl-email2-${placement}`} className="sr-only">
          Your email
        </label>
        <input
          id={`nl-email2-${placement}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={state.kind === "submitting"}
          className="flex-1 rounded-full border border-ink-200 bg-white px-6 py-3.5 text-sm text-navy-900 placeholder-ink-400 focus:outline-none disabled:opacity-60 sm:text-base"
        />
        <button
          type="submit"
          disabled={state.kind === "submitting"}
          className="rounded-full bg-navy-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60 sm:text-base"
        >
          {state.kind === "submitting" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {state.kind === "error" && (
        <p className="mt-2 text-xs text-red-600">{state.message}</p>
      )}
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-500">
        <Mail className="h-3 w-3" aria-hidden />
        Bi-weekly. No spam. One-click unsubscribe.
      </p>
    </div>
  );
}
