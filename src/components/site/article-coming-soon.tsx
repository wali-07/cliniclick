import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NewsletterSignup } from "@/components/content/newsletter-signup";

type ParentInfo = {
  /** "Acne" / "Botox" / "Soprano Ice Platinum" */
  displayName: string;
  /** "/concerns/acne" - link back to the parent hub */
  hubHref: string;
  /** "Concerns" / "Treatments" / "Devices" - top-level breadcrumb label */
  hubLabel: string;
  /** "/concerns" - link to the top-level hub */
  hubBaseHref: string;
};

/**
 * Rendered when a parent hub links to an article that is expected but not
 * yet published. This is the locked design behaviour: the link still goes
 * to the article URL, and the sub-page renders coming-soon (never a 404).
 * The route sets robots:noindex so these thin pages are never indexed.
 */
export function ArticleComingSoon({
  title,
  eyebrow,
  parent,
  surface,
}: {
  title: string;
  eyebrow: string;
  parent: ParentInfo;
  surface: string;
}) {
  return (
    <article className="relative bg-gradient-to-b from-purple-100/30 via-white to-purple-50/40">
      <header className="relative border-b border-purple-100/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-40 left-1/3 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-purple-200/40 to-transparent blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-8 pb-12 sm:pt-12 sm:pb-16">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500"
          >
            <Link href={parent.hubBaseHref} className="transition hover:text-navy-900">
              {parent.hubLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-400" aria-hidden />
            <Link href={parent.hubHref} className="transition hover:text-navy-900">
              {parent.displayName}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-400" aria-hidden />
            <span className="font-medium text-navy-900">{title}</span>
          </nav>

          <div className="mt-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-700 shadow-[0_2px_8px_rgba(167,92,255,0.15)]">
              <span
                aria-hidden
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500"
              />
              Coming soon
            </span>
            <span className="mt-4 block text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
              {eyebrow}
            </span>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-navy-900 sm:text-5xl md:text-[56px]">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
              We&apos;re researching and writing this one properly - with cited
              sources, real local context, and the same honest, no-hype
              approach that makes the rest of CliniClick worth your time.
              We&apos;d rather publish it right than publish it fast.
            </p>
          </div>
        </div>
      </header>

      <div className="relative">
        <div className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
          <div className="max-w-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
              Be first to read it
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-4xl">
              We&apos;ll tell you the moment it&apos;s live
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              Join the Brief and we&apos;ll email you when this goes live, along
              with the other reads we publish each week. No noise, easy to leave.
            </p>
            <div className="mt-8">
              <NewsletterSignup surface={surface} variant="inline" />
            </div>
          </div>

          <div className="mt-12 border-t border-ink-100 pt-8 text-sm text-ink-600">
            <p>Meanwhile, keep exploring:</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <li>
                <Link
                  href={parent.hubHref}
                  className="text-purple-700 hover:underline"
                >
                  More on {parent.displayName.toLowerCase()} &rarr;
                </Link>
              </li>
              <li>
                <Link
                  href={parent.hubBaseHref}
                  className="text-purple-700 hover:underline"
                >
                  Browse all {parent.hubLabel.toLowerCase()} &rarr;
                </Link>
              </li>
              <li>
                <Link href="/concerns" className="text-purple-700 hover:underline">
                  Browse concerns &rarr;
                </Link>
              </li>
              <li>
                <Link
                  href="/how-we-write-our-content"
                  className="text-purple-700 hover:underline"
                >
                  How we write our content &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
