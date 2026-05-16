import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ComingSoonPage } from "@/components/content/coming-soon-page";
import { Eyebrow } from "@/components/content/eyebrow";
import { NewsletterSignup } from "@/components/content/newsletter-signup";
import { getPublishedGuides } from "@/lib/content/articles";

export const metadata = {
  title: "Guides",
  description:
    "Practical guides for navigating aesthetic medicine - pricing, licensing, what to ask in a consultation, and other things worth knowing before you book.",
};

export default function LearnHubPage() {
  const guides = getPublishedGuides();

  if (guides.length === 0) {
    return (
      <ComingSoonPage
        axis="guide"
        title="Guides - coming soon"
        description="Practical reads that change how you walk into your next consultation. How aesthetic pricing actually works, how to verify a license, how to read a clinic's claims, and more."
        surface="learn-hub"
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <Eyebrow axis="guide" />
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
        Guides
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-ink-600">
        Practical reads that change how you walk into your next consultation -
        how pricing actually works, how to verify a license, what to ask, and
        more.
      </p>

      <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/learn/${g.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.10)]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                Guide
              </span>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-navy-900">
                {g.title}
              </h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-600">
                {g.dek}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 transition group-hover:gap-2">
                Read guide
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-14 border-t border-ink-100 pt-8">
        <p className="text-sm text-ink-600">
          More guides land every week. Join the Brief and we&apos;ll email you
          when they go live.
        </p>
        <div className="mt-6">
          <NewsletterSignup surface="learn-hub" variant="inline" />
        </div>
      </div>
    </div>
  );
}
