"use client";

/**
 * Hides the consumer chrome (header / footer / mobile nav / analytics /
 * site JSON-LD) on the admin dashboard, which lives on the admin.* subdomain
 * (rewritten to /admin/*). Client-only check so the consumer site stays
 * statically rendered (no headers()/dynamic deopt). The host check is the
 * reliable signal on the subdomain; the pathname check covers /admin direct.
 */

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteShell({
  header,
  footer,
  mobileNav,
  analytics,
  jsonLd,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  mobileNav: ReactNode;
  analytics: ReactNode;
  jsonLd: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith("/admin") === true ||
    (typeof window !== "undefined" &&
      window.location.host.split(":")[0].toLowerCase().startsWith("admin."));

  if (isAdmin) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      {jsonLd}
      {header}
      <main id="main">{children}</main>
      {footer}
      {mobileNav}
      {analytics}
    </>
  );
}
