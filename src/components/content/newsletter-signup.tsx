/**
 * Newsletter capture for "The CliniClick Brief" (bi-weekly).
 * Used on home, hubs, and the bottom of articles where booking-readiness slot
 * doesn't fit (e.g., guide articles).
 */

export function NewsletterSignup({
  surface = "general",
  variant = "card",
}: {
  surface?: string;
  variant?: "card" | "inline";
}) {
  if (variant === "inline") {
    return (
      <form
        action="/api/subscribe"
        method="post"
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        data-capture-surface={surface}
      >
        <input type="hidden" name="surface" value={surface} />
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
          className="flex-1 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm text-ink-900 placeholder-ink-400 focus:border-purple-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-navy-700"
        >
          Subscribe
        </button>
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
        Honest aesthetic explainers, every two weeks.
      </h2>
      <p className="mt-3 max-w-xl text-sm text-navy-100/80 sm:text-base">
        One short read. One piece of marketing language explained. One practical
        question to ask at your next consultation. No fluff, no hype.
      </p>
      <form
        action="/api/subscribe"
        method="post"
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
        <input type="hidden" name="surface" value={surface} />
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
          className="flex-1 rounded-full border border-navy-700 bg-navy-800 px-5 py-3 text-sm text-white placeholder-navy-100/60 focus:border-purple-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-purple-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-400"
        >
          Subscribe
        </button>
      </form>
      <p className="mt-3 text-xs text-navy-100/60">
        Free. Unsubscribe anytime. Your email stays with us only.
      </p>
    </section>
  );
}
