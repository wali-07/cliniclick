import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-navy-700 bg-navy-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex text-base font-semibold text-white">
              Clini<span className="text-purple-400">Click</span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-navy-100/80">
              The UAE&apos;s evidence-based guide to aesthetic treatments. Information only - not medical advice.
            </p>
          </div>
          <div>
            <p className="eyebrow text-purple-300">Explore</p>
            <ul className="mt-4 space-y-2 text-sm">
              {siteConfig.nav.primary.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-navy-100/80 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-purple-300">About</p>
            <ul className="mt-4 space-y-2 text-sm">
              {siteConfig.nav.footer.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-navy-100/80 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-navy-700 pt-8 text-xs text-navy-100/60 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Made in Dubai · {siteConfig.country}</p>
        </div>
      </div>
    </footer>
  );
}
