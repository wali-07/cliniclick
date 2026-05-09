/**
 * Mobile-only auto-scrolling marquee of preview cards under the hero search.
 * Continuous infinite loop with gradient edge-fades for a "live ticker" feel.
 * Pauses on hover/focus and respects prefers-reduced-motion.
 *
 * Pattern: render the cards twice, animate the inner track to translateX(-50%).
 * Because copy 2 is identical to copy 1, when copy 1 has scrolled off the
 * viewport the loop snaps imperceptibly back to start.
 */
import {
  Sparkles,
  Syringe,
  Droplet,
  BookOpenCheck,
  Zap,
  Wand2,
} from "lucide-react";

const cards = [
  { type: "CONCERN", title: "Acne", sub: "Causes, options, costs", icon: Sparkles },
  { type: "TREATMENT", title: "Botox", sub: "AED 700-2,500 / area", icon: Syringe },
  { type: "CONCERN", title: "Pigmentation", sub: "Causes, treatments, results", icon: Droplet },
  { type: "TREATMENT", title: "Laser hair removal", sub: "6-10 sessions, every 4-6 wks", icon: Zap },
  { type: "CONCERN", title: "Hair loss", sub: "Pattern, postpartum, treatments", icon: Wand2 },
  { type: "GUIDE", title: "How clinic pricing works", sub: "Empowerment, not ads", icon: BookOpenCheck },
];

function Card({
  type,
  title,
  sub,
  icon: Icon,
}: {
  type: string;
  title: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="w-[220px] flex-shrink-0 rounded-2xl border border-ink-100 bg-white/90 p-4 shadow-[0_8px_24px_rgba(0,20,53,0.06)] backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-md border border-ink-200 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700">
          {type}
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-purple-50 text-purple-600">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-semibold leading-tight text-navy-900">{title}</p>
      <p className="mt-0.5 truncate text-[11px] text-ink-500">{sub}</p>
    </div>
  );
}

export function MobilePreviewRail() {
  return (
    <div className="lg:hidden">
      <div className="edge-fade-x relative -mx-6 overflow-hidden">
        <div className="animate-marquee flex w-max gap-3 px-6 py-1">
          {/* Copy 1 */}
          {cards.map((c, i) => (
            <Card key={`a-${i}`} {...c} />
          ))}
          {/* Copy 2 - identical, makes the loop seamless */}
          {cards.map((c, i) => (
            <Card key={`b-${i}`} {...c} />
          ))}
        </div>
      </div>
    </div>
  );
}
