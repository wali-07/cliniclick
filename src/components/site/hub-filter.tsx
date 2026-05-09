"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";

export type HubItem = {
  slug: string;
  name: string;
  shortDescription: string;
  href: string;
  group: string;
  searchTerms?: string[];
};

export type HubGroup = {
  id: string;
  label: string;
  intro?: string;
};

/**
 * Client-side filterable, grouped list used by Concerns / Treatments / Devices hubs.
 * Search filters across name + searchTerms. Groups with no matches hide automatically.
 * Each group renders as its own H2 section so it builds a clean SEO topical cluster.
 */
export function HubFilter({
  items,
  groups,
  searchPlaceholder,
  emptyMessage,
}: {
  items: HubItem[];
  groups: HubGroup[];
  searchPlaceholder: string;
  emptyMessage: string;
}) {
  const [query, setQuery] = useState("");

  const filteredByGroup = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (item: HubItem) => {
      if (!q) return true;
      const haystack = [item.name.toLowerCase(), ...(item.searchTerms ?? []).map((s) => s.toLowerCase())];
      return haystack.some((h) => h.includes(q));
    };
    return groups
      .map((g) => ({ group: g, items: items.filter((i) => i.group === g.id && matches(i)) }))
      .filter((g) => g.items.length > 0);
  }, [items, groups, query]);

  const totalMatches = filteredByGroup.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <>
      {/* Search */}
      <div className="mt-10">
        <div
          className={`flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-[0_1px_0_rgba(0,20,53,0.04)] transition ${
            query ? "border-navy-900" : "border-ink-200"
          }`}
        >
          <Search className="h-5 w-5 flex-shrink-0 text-ink-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full bg-transparent text-base text-navy-900 placeholder-ink-400 focus:outline-none focus-visible:outline-none sm:text-lg"
          />
          {query && (
            <span className="text-xs font-medium text-ink-500">
              {totalMatches} {totalMatches === 1 ? "match" : "matches"}
            </span>
          )}
        </div>
      </div>

      {/* Grouped results */}
      {filteredByGroup.length > 0 ? (
        <div className="mt-12 space-y-16">
          {filteredByGroup.map(({ group, items: groupItems }) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <div className="flex items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
                    {group.label}
                  </span>
                  <h2
                    id={`group-${group.id}`}
                    className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-navy-900 sm:text-3xl"
                  >
                    {group.label}
                  </h2>
                  {group.intro && (
                    <p className="mt-2 text-sm text-ink-600 sm:text-base">{group.intro}</p>
                  )}
                </div>
                <span className="hidden text-xs text-ink-500 sm:block">
                  {groupItems.length} {groupItems.length === 1 ? "topic" : "topics"}
                </span>
              </div>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groupItems.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      className="group flex h-full items-start justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-5 transition hover:border-purple-200 hover:shadow-[0_8px_28px_rgba(167,92,255,0.08)]"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-semibold text-navy-900">
                          {item.name}
                        </span>
                        <span className="mt-1 block text-sm leading-snug text-ink-600">
                          {item.shortDescription}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="mt-1 h-4 w-4 flex-shrink-0 text-ink-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-700"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-2xl border border-ink-100 bg-white p-8 text-center">
          <p className="text-sm text-ink-700">{emptyMessage}</p>
        </div>
      )}
    </>
  );
}
