/**
 * Two floating preview cards at the upper corners of the hero section.
 * Decorative on lg+ only. Reduced from four to two to keep the hero clean
 * while preserving the tech-forward "live product" feel.
 */
import { Sparkles, BookOpenCheck } from "lucide-react";

const cards = [
  {
    type: "CONCERN",
    title: "Acne",
    sub: "Causes, options, costs",
    icon: Sparkles,
    pos: "top-12 left-6 xl:top-16 xl:left-12 -rotate-[4deg]",
  },
  {
    type: "GUIDE",
    title: "Pricing explained",
    sub: "Empowerment, not ads",
    icon: BookOpenCheck,
    pos: "top-12 right-6 xl:top-16 xl:right-12 rotate-[4deg]",
  },
];

export function FloatingPreviewCards() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      {cards.map(({ type, title, sub, icon: Icon, pos }, i) => (
        <div
          key={`${type}-${i}`}
          className={`absolute ${pos} pointer-events-auto w-[200px] rounded-2xl border border-ink-100 bg-white p-3.5 shadow-[0_18px_48px_rgba(0,20,53,0.10)] transition hover:rotate-0 hover:scale-[1.04]`}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-md border border-ink-200 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700">
              {type}
            </span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-purple-50 text-purple-600">
              <Icon className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold leading-tight text-navy-900">{title}</p>
          <p className="mt-0.5 text-[11px] text-ink-500">{sub}</p>
        </div>
      ))}
    </div>
  );
}
