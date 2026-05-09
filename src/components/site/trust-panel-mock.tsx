/**
 * Visual mockup of an editorial-trust verification panel.
 * Mirrors the show-don't-tell approach of ArticlePreviewMock - a stylised
 * card that demonstrates the four trust promises in action.
 */
import { Check, ShieldCheck } from "lucide-react";

const checks = [
  { label: "Independent", detail: "No paid editorial" },
  { label: "Evidence-cited", detail: "NHS · Mayo · AAD" },
  { label: "Locally relevant", detail: "Local pricing · all skin tones · real-world context" },
  { label: "Empowering", detail: "Criteria, not commands" },
];

export function TrustPanelMock() {
  return (
    <div className="relative">
      {/* Decorative background bloom */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-purple-200/40 via-purple-100/20 to-transparent blur-2xl"
      />

      {/* Back card peek */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 translate-x-4 translate-y-4 -rotate-1 rounded-3xl border border-ink-100 bg-white opacity-60 shadow-[0_10px_40px_rgba(0,20,53,0.06)]"
      />

      {/* Main verification panel */}
      <article className="relative rounded-3xl border border-ink-100 bg-white p-7 shadow-[0_18px_50px_rgba(0,20,53,0.08)] sm:p-8">
        {/* Header strip */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-purple-300 bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            EDITORIAL · VERIFIED
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">
            cliniclick.ae
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-5 text-xl font-semibold leading-snug tracking-[-0.01em] text-navy-900">
          Trust check
        </h3>
        <p className="mt-1 text-xs text-ink-500">
          Every article we publish runs through these four gates.
        </p>

        {/* Checklist */}
        <ul className="mt-5 divide-y divide-ink-100">
          {checks.map(({ label, detail }) => (
            <li key={label} className="flex items-center gap-3 py-3">
              <span
                aria-hidden
                className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-purple-50 text-purple-700"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy-900">{label}</p>
                <p className="text-xs text-ink-500">{detail}</p>
              </div>
              <span className="text-[10px] font-semibold tracking-wider text-purple-600">PASS</span>
            </li>
          ))}
        </ul>

        {/* Footer meta */}
        <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4 text-[11px] text-ink-500">
          <span>Last reviewed today</span>
          <span>Independent · No paid editorial</span>
        </div>
      </article>
    </div>
  );
}
