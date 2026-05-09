"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Sparkles,
  Syringe,
  Droplet,
  BookOpenCheck,
} from "lucide-react";

type SearchItem = {
  type: "concern" | "treatment" | "machine";
  slug: string;
  name: string;
  shortDescription: string;
  alternateNames?: readonly string[];
};

const TYPE_LABEL: Record<SearchItem["type"], string> = {
  concern: "CONCERN",
  treatment: "TREATMENT",
  machine: "MACHINE",
};

const TYPE_HREF: Record<SearchItem["type"], string> = {
  concern: "/concerns",
  treatment: "/treatments",
  machine: "/machines",
};

// Card-style suggestions shown inside the dropdown when the search is empty.
// Mirrors the floating preview cards' visual language.
const suggestionCards: Array<{
  type: "CONCERN" | "TREATMENT" | "MACHINE" | "GUIDE";
  title: string;
  sub: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { type: "CONCERN", title: "Acne", sub: "Causes, options, costs", href: "/concerns/acne", icon: Sparkles },
  { type: "TREATMENT", title: "Botox", sub: "AED 700-2,500 / area", href: "/treatments/botox", icon: Syringe },
  { type: "CONCERN", title: "Pigmentation", sub: "Common in Gulf climate", href: "/concerns/pigmentation", icon: Droplet },
  { type: "GUIDE", title: "Pricing explained", sub: "Empowerment, not ads", href: "/learn", icon: BookOpenCheck },
];

// Words the placeholder cycles through (typewriter animation when idle).
// Mix of concerns, treatments, and devices.
const PLACEHOLDER_WORDS = [
  "acne",
  "botox",
  "laser hair removal",
  "pigmentation",
  "PicoSure",
  "dark circles",
];

export function HeroSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [typed, setTyped] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter placeholder animation. Runs only when the input is idle
  // (no value, not focused). Respects prefers-reduced-motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (query.length > 0 || open) return;

    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(PLACEHOLDER_WORDS[0]);
      return;
    }

    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const currentWord = PLACEHOLDER_WORDS[wordIdx];

      if (!isDeleting) {
        charIdx += 1;
        setTyped(currentWord.slice(0, charIdx));
        if (charIdx >= currentWord.length) {
          isDeleting = true;
          timeoutId = setTimeout(tick, 1600); // hold complete word
          return;
        }
        timeoutId = setTimeout(tick, 90);
      } else {
        charIdx -= 1;
        setTyped(currentWord.slice(0, charIdx));
        if (charIdx <= 0) {
          isDeleting = false;
          wordIdx = (wordIdx + 1) % PLACEHOLDER_WORDS.length;
          timeoutId = setTimeout(tick, 350); // pause before next
          return;
        }
        timeoutId = setTimeout(tick, 40);
      }
    };

    timeoutId = setTimeout(tick, 600); // initial delay
    return () => clearTimeout(timeoutId);
  }, [query.length, open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return items
      .filter((item) => {
        const haystack = [
          item.name.toLowerCase(),
          ...(item.alternateNames ?? []).map((n) => n.toLowerCase()),
        ];
        return haystack.some((h) => h.includes(q));
      })
      .slice(0, 7);
  }, [items, query]);

  const trimmed = query.trim();
  const mode: "suggestions" | "results" | "empty" = !open
    ? "suggestions"
    : trimmed.length < 2
      ? "suggestions"
      : results.length > 0
        ? "results"
        : "empty";

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => setHighlighted(0), [mode, results.length]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (mode !== "results" || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && results[highlighted]) {
      e.preventDefault();
      const item = results[highlighted];
      window.location.href = `${TYPE_HREF[item.type]}/${item.slug}`;
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white px-5 py-4 shadow-[0_1px_0_rgba(0,20,53,0.04)] transition hover:border-ink-300">
        <Search className="h-5 w-5 flex-shrink-0 text-ink-400" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={open || query ? "Search a concern, treatment, or device..." : typed}
          aria-label="Search concerns, treatments, or devices"
          aria-autocomplete="list"
          aria-controls="hero-search-results"
          className="w-full bg-transparent text-base text-navy-900 placeholder-ink-400 focus:outline-none focus-visible:outline-none sm:text-lg"
        />
        <span className="hidden flex-shrink-0 rounded-md border border-ink-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-500 sm:inline-block">
          Search
        </span>
      </div>

      {open && (
        <div
          id="hero-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[0_20px_48px_rgba(0,20,53,0.12)]"
        >
          {/* SUGGESTIONS - card grid (replaces the list of popular text items) */}
          {mode === "suggestions" && (
            <>
              <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                <TrendingUp className="h-3.5 w-3.5 text-purple-600" aria-hidden />
                Popular
              </div>
              <ul className="grid grid-cols-1 gap-px bg-ink-100 sm:grid-cols-2">
                {suggestionCards.map((c) => (
                  <li key={c.title} role="option" aria-selected="false">
                    <Link
                      href={c.href}
                      className="group flex h-full items-start gap-3 bg-white p-4 transition hover:bg-ink-50/60"
                    >
                      <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-100">
                        <c.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-navy-900">{c.title}</span>
                          <span className="inline-flex items-center rounded-md border border-ink-200 px-1 py-0.5 text-[9px] font-semibold tracking-wider text-purple-700">
                            {c.type}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-ink-500">{c.sub}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* RESULTS */}
          {mode === "results" && (
            <ul className="max-h-[420px] overflow-y-auto">
              {results.map((item, i) => (
                <li key={`${item.type}-${item.slug}`} role="option" aria-selected={i === highlighted}>
                  <Link
                    href={`${TYPE_HREF[item.type]}/${item.slug}`}
                    className={`flex items-start gap-4 px-5 py-4 text-left transition ${
                      i === highlighted ? "bg-ink-50/80" : "bg-white hover:bg-ink-50/60"
                    }`}
                    onMouseEnter={() => setHighlighted(i)}
                  >
                    <span className="mt-1 inline-flex flex-shrink-0 rounded-md border border-ink-200 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700">
                      {TYPE_LABEL[item.type]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-navy-900">{item.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-ink-500">
                        {item.shortDescription}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* EMPTY */}
          {mode === "empty" && (
            <div className="px-5 py-6 text-sm">
              <p className="font-medium text-navy-900">
                No match for &ldquo;{query}&rdquo; - yet.
              </p>
              <p className="mt-1 text-ink-600">
                We&apos;re continually expanding our coverage. Browse{" "}
                <Link href="/concerns" className="text-purple-700 hover:underline">concerns</Link>,{" "}
                <Link href="/treatments" className="text-purple-700 hover:underline">treatments</Link>, or{" "}
                <Link href="/machines" className="text-purple-700 hover:underline">devices</Link>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
