"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Syringe, Zap, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/", icon: Home, match: (p: string) => p === "/" },
  { label: "Concerns", href: "/concerns", icon: Sparkles, match: (p: string) => p.startsWith("/concerns") },
  { label: "Treatments", href: "/treatments", icon: Syringe, match: (p: string) => p.startsWith("/treatments") },
  { label: "Devices", href: "/machines", icon: Zap, match: (p: string) => p.startsWith("/machines") },
  { label: "Quiz", href: "/quiz", icon: Compass, match: (p: string) => p.startsWith("/quiz") },
];

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/85 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ label, href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-tight transition",
                  active ? "text-purple-700" : "text-ink-500"
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-purple-500"
                  />
                )}
                <Icon className={cn("h-5 w-5 transition", active && "scale-110")} aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
