/**
 * Trust promises - minimal, scannable.
 * Just icon + title + body. No cards, no demos, no number badges.
 * Floats on the section's soft purple gradient.
 */
import {
  ShieldCheck,
  FileText,
  Globe2,
  HeartHandshake,
} from "lucide-react";

const promises = [
  {
    icon: ShieldCheck,
    title: "Independent",
    body: "No paid editorial. No clinic can buy a recommendation.",
  },
  {
    icon: FileText,
    title: "Evidence-cited",
    body: "Every medical claim links to a primary source you can verify.",
  },
  {
    icon: Globe2,
    title: "Locally relevant",
    body: "Local pricing, all skin tones, real-world context.",
  },
  {
    icon: HeartHandshake,
    title: "Empowering",
    body: "We give you criteria and questions, never commands.",
  },
];

export function PromiseCards() {
  return (
    <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-8">
      {promises.map(({ icon: Icon, title, body }) => (
        <li key={title}>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-purple-700 shadow-[0_4px_16px_rgba(167,92,255,0.12)]">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy-900">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            {body}
          </p>
        </li>
      ))}
    </ul>
  );
}
