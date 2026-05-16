"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpRight,
  X,
  Sparkles,
  Droplet,
  Activity,
  Eye,
  Wand2,
  Scissors,
  User,
  Heart,
  Syringe,
  Zap,
  Cpu,
  FlaskConical,
  ScanFace,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  droplet: Droplet,
  activity: Activity,
  eye: Eye,
  wand: Wand2,
  scissors: Scissors,
  user: User,
  heart: Heart,
  syringe: Syringe,
  zap: Zap,
  cpu: Cpu,
  flask: FlaskConical,
  scan: ScanFace,
  layers: Layers,
  all: LayoutGrid,
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Comp = ICONS[name] ?? Sparkles;
  return <Comp className={className} />;
}

export type HubItem = {
  slug: string;
  name: string;
  shortDescription: string;
  href: string;
  group: string;
  groupLabel?: string;
  icon: string;
  meta?: string[];
  searchTerms?: string[];
  /** When true, the card shows a "Coming soon" pill instead of the arrow. */
  comingSoon?: boolean;
};

export type HubGroup = {
  id: string;
  label: string;
  icon: string;
};

export function HubBrowser({
  items,
  groups,
  searchPlaceholder,
  cyclingWords,
}: {
  items: HubItem[];
  groups: HubGroup[];
  searchPlaceholder: string;
  /** Optional: cycle these words as a typewriter placeholder when idle. */
  cyclingWords?: string[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [focused, setFocused] = useState(false);
  const [typed, setTyped] = useState("");

  // Typewriter placeholder animation - mirrors HeroSearch's pattern.
  useEffect(() => {
    if (!cyclingWords || cyclingWords.length === 0) return;
    if (typeof window === "undefined") return;
    if (query.length > 0 || focused) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(cyclingWords[0]);
      return;
    }

    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const currentWord = cyclingWords[wordIdx];
      if (!isDeleting) {
        charIdx += 1;
        setTyped(currentWord.slice(0, charIdx));
        if (charIdx >= currentWord.length) {
          isDeleting = true;
          timeoutId = setTimeout(tick, 1600);
          return;
        }
        timeoutId = setTimeout(tick, 90);
      } else {
        charIdx -= 1;
        setTyped(currentWord.slice(0, charIdx));
        if (charIdx <= 0) {
          isDeleting = false;
          wordIdx = (wordIdx + 1) % cyclingWords.length;
          timeoutId = setTimeout(tick, 350);
          return;
        }
        timeoutId = setTimeout(tick, 40);
      }
    };

    timeoutId = setTimeout(tick, 600);
    return () => clearTimeout(timeoutId);
  }, [cyclingWords, query.length, focused]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const categoryMatch = activeCategory === "all" || item.group === activeCategory;
      if (!categoryMatch) return false;
      if (!q) return true;
      const haystack = [
        item.name.toLowerCase(),
        ...(item.searchTerms ?? []).map((s) => s.toLowerCase()),
      ];
      return haystack.some((h) => h.includes(q));
    });
  }, [items, activeCategory, query]);

  const groupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((i) => counts.set(i.group, (counts.get(i.group) ?? 0) + 1));
    return counts;
  }, [items]);

  const placeholder = !query && !focused && cyclingWords && cyclingWords.length > 0 ? typed : searchPlaceholder;

  return (
    <>
      {/* Filter panel - non-sticky, just sits at the top of the section. */}
      <div className="py-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-ink-100 bg-white/95 p-3 shadow-[0_8px_32px_rgba(0,20,53,0.08)] backdrop-blur-md">
          {/* Search */}
          <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-3 transition hover:border-ink-300">
            <Search className="h-4 w-4 flex-shrink-0 text-ink-400" aria-hidden />
            <input
              type="search"
              value={query}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              aria-label={searchPlaceholder}
              className="w-full bg-transparent text-sm text-navy-900 placeholder-ink-400 focus:outline-none focus-visible:outline-none sm:text-base"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="grid h-6 w-6 place-items-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-navy-900"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>

          {/* Chip filter row */}
          <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
            <ChipButton
              label="All"
              icon="all"
              count={items.length}
              isActive={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            />
            {groups.map((g) => (
              <ChipButton
                key={g.id}
                label={g.label}
                icon={g.icon}
                count={groupCounts.get(g.id) ?? 0}
                isActive={activeCategory === g.id}
                onClick={() => setActiveCategory(g.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="mx-auto max-w-6xl px-0 pb-14 pt-6 sm:pb-20">
        {filtered.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.10)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-700 transition group-hover:scale-105 group-hover:bg-purple-100">
                      <Icon name={item.icon} className="h-5 w-5" />
                    </span>
                    {item.comingSoon ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-700">
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500"
                        />
                        Coming soon
                      </span>
                    ) : (
                      <ArrowUpRight
                        className="h-4 w-4 text-ink-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-700"
                        aria-hidden
                      />
                    )}
                  </div>
                  {item.groupLabel && (
                    <span className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-700">
                      {item.groupLabel}
                    </span>
                  )}
                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-navy-900">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                    {item.shortDescription}
                  </p>
                  {item.meta && item.meta.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {item.meta.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-ink-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-ink-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center">
            <p className="text-base text-ink-700">
              No matches yet. Try a broader term or pick a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory("all");
              }}
              className="mt-4 inline-flex rounded-full border border-ink-200 bg-white px-5 py-2 text-sm font-medium text-navy-900 transition hover:border-navy-900"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function ChipButton({
  label,
  icon,
  count,
  isActive,
  onClick,
}: {
  label: string;
  icon: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
        isActive
          ? "border-navy-900 bg-navy-900 text-white"
          : "border-ink-200 bg-white text-ink-700 hover:border-navy-900 hover:text-navy-900"
      )}
      aria-pressed={isActive}
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px] font-semibold",
          isActive ? "bg-white/20 text-white" : "bg-ink-100 text-ink-600"
        )}
      >
        {count}
      </span>
    </button>
  );
}
