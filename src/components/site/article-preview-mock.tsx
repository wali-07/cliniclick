/**
 * Visual mockup of what a CliniClick treatment article will look like.
 * Used in the homepage "Why CliniClick exists" section as a product preview.
 * Pure presentational, no real data.
 */
export function ArticlePreviewMock() {
  return (
    <div className="relative">
      {/* Decorative background gradient */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-purple-200/40 via-purple-100/20 to-transparent blur-2xl"
      />

      {/* Stack of two cards - back card peeking */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rotate-1 rounded-3xl border border-ink-100 bg-white opacity-60 shadow-[0_10px_40px_rgba(0,20,53,0.06)]"
      />

      {/* Main mock article card */}
      <article className="relative rounded-3xl border border-ink-100 bg-white p-7 shadow-[0_18px_50px_rgba(0,20,53,0.08)] sm:p-9">
        {/* Top meta row */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-md border border-ink-200 bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700">
            TREATMENT
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">
            cliniclick.ae
          </span>
        </div>

        {/* Title + meta */}
        <h3 className="mt-5 text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-navy-900">
          Botox in the UAE: how it works, what it costs, and what to ask
        </h3>
        <p className="mt-3 text-xs text-ink-500">
          Last reviewed today · 8 min read · Independent
        </p>

        {/* Body sample */}
        <div className="mt-6 space-y-3 text-sm leading-relaxed text-ink-700">
          <p>
            Botulinum toxin (sold as Botox, Dysport, Xeomin, and others) is a
            prescription injectable that temporarily relaxes specific facial
            muscles to soften dynamic wrinkles -{" "}
            <span className="rounded bg-purple-50 px-1 text-purple-800 underline decoration-purple-300 underline-offset-2">
              forehead lines, frown lines, and crow&apos;s feet
            </span>
            <sup className="ml-0.5 text-purple-600">[1]</sup>.
          </p>
          <p>
            Effects appear over 7-14 days and typically last 3-4 months
            <sup className="ml-0.5 text-purple-600">[2]</sup>. In the UAE, prices
            range from{" "}
            <span className="font-medium text-navy-900">AED 700-2,500 per area</span>{" "}
            depending on units, area, and clinician seniority.
          </p>
        </div>

        {/* Block - Practical context callout */}
        <div className="mt-6 rounded-xl border border-purple-100 bg-purple-50/50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-700">
            Practical context
          </p>
          <p className="mt-1 text-xs text-ink-700">
            Avoid direct sun and intense heat for 24 hours after injection -
            particularly relevant in hotter climates.
          </p>
        </div>

        {/* Cross-axis chips */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-500">
            Related:
          </span>
          {["Wrinkles", "Dermal fillers", "Skin laxity"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-ink-200 px-2.5 py-0.5 text-[11px] font-medium text-ink-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Sources strip */}
        <div className="mt-6 border-t border-ink-100 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            Sources
          </p>
          <ul className="mt-2 space-y-1 text-[11px] text-ink-600">
            <li>[1] American Academy of Dermatology - Botulinum toxin therapy</li>
            <li>[2] NHS - Botulinum toxin injections (cosmetic)</li>
          </ul>
        </div>
      </article>
    </div>
  );
}
