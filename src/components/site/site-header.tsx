import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-navy-900"
          aria-label="CliniClick home"
        >
          Clini<span className="text-purple-600">Click</span>
        </Link>
        <nav
          className="hidden items-center gap-8 text-sm font-medium text-ink-700 md:flex"
          aria-label="Primary"
        >
          {siteConfig.nav.primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-navy-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/quiz"
            className="hidden rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 md:inline-flex"
          >
            Take the quiz
          </Link>
        </div>
      </div>
    </header>
  );
}
