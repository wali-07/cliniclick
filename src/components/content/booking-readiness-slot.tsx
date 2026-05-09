/**
 * The booking-readiness "next step" slot.
 * Phase 1 (now): "coming soon" + email capture for the relevant treatment/concern/machine.
 * Phase 2: live filterable clinic list.
 * Phase 3: live booking action.
 *
 * The component slot is in templates from day one so visual real-estate,
 * position, and reader expectation stay stable across phases.
 */
type Subject =
  | { type: "treatment"; slug: string; name: string }
  | { type: "concern"; slug: string; name: string }
  | { type: "machine"; slug: string; name: string };

export function BookingReadinessSlot({ subject }: { subject: Subject }) {
  const subjectLabel = subject.name;
  const captureSurface = `${subject.type}-${subject.slug}`;

  return (
    <aside
      className="rounded-2xl border border-purple-100 bg-purple-50/60 p-6 sm:p-8"
      aria-labelledby="booking-readiness-heading"
    >
      <p className="eyebrow">Coming soon</p>
      <h2
        id="booking-readiness-heading"
        className="mt-2 text-xl font-semibold tracking-tight text-navy-900 sm:text-2xl"
      >
        See clinics in the UAE offering {subjectLabel}
      </h2>
      <p className="mt-2 text-sm text-ink-700">
        We&apos;re building an independent clinic directory so you can compare
        verified providers, prices, and practitioners before you book. Want to
        know the moment it&apos;s live?
      </p>

      <form
        className="mt-5 flex flex-col gap-2 sm:flex-row"
        action="/api/notify"
        method="post"
        data-capture-surface={captureSurface}
      >
        <input type="hidden" name="surface" value={captureSurface} />
        <label htmlFor={`notify-email-${subject.slug}`} className="sr-only">
          Your email
        </label>
        <input
          id={`notify-email-${subject.slug}`}
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          className="flex-1 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm text-ink-900 placeholder-ink-400 focus:border-purple-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-navy-700"
        >
          Notify me
        </button>
      </form>
      <p className="mt-3 text-xs text-ink-500">
        We&apos;ll only email you about {subjectLabel}-related updates and our
        bi-weekly Brief. Unsubscribe anytime.
      </p>
    </aside>
  );
}
