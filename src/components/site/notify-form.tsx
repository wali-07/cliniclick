"use client";

import { useState } from "react";
import { Check } from "lucide-react";

/**
 * Email capture form used in every "notify me when bookings launch" panel.
 * POSTs to /api/notify which adds the contact to the Resend audience.
 * Single opt-in - no confirm email round-trip; once they hit submit they
 * are on the list.
 */
export function NotifyForm({
  surface,
  buttonLabel = "Notify me",
  placeholder = "you@example.com",
}: {
  surface: string;
  buttonLabel?: string;
  placeholder?: string;
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
        body: JSON.stringify({ email, surface }),
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
      setState({
        kind: "error",
        message: "Network error - please try again",
      });
    }
  }

  if (state.kind === "success") {
    return (
      <div className="mx-auto mt-10 flex max-w-lg items-center justify-center gap-2 rounded-full border border-purple-200 bg-white px-6 py-4 text-sm font-medium text-navy-900 shadow-[0_4px_12px_rgba(167,92,255,0.10)]">
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-full bg-purple-100 text-purple-700"
        >
          <Check className="h-3.5 w-3.5" />
        </span>
        You&apos;re on the list. We&apos;ll be in touch when the directory is
        live.
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-lg">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 sm:flex-row"
        data-capture-surface={surface}
      >
        <label htmlFor={`notify-${surface}`} className="sr-only">
          Your email
        </label>
        <input
          id={`notify-${surface}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={placeholder}
          disabled={state.kind === "submitting"}
          className="flex-1 rounded-full border border-ink-200 bg-white px-6 py-3.5 text-sm text-navy-900 placeholder-ink-400 focus:outline-none disabled:opacity-60 sm:text-base"
        />
        <button
          type="submit"
          disabled={state.kind === "submitting"}
          className="rounded-full bg-navy-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60 sm:text-base"
        >
          {state.kind === "submitting" ? "Submitting..." : buttonLabel}
        </button>
      </form>
      {state.kind === "error" && (
        <p className="mt-2 text-xs text-red-600">{state.message}</p>
      )}
    </div>
  );
}
