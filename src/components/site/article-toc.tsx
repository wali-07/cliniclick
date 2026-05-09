"use client";

import { useEffect, useState } from "react";
import type { ArticleBlock } from "@/lib/content/types";
import { headingId } from "@/lib/content/articles";

type TocItem = { id: string; text: string };

export function ArticleToc({ blocks }: { blocks: ArticleBlock[] }) {
  const items: TocItem[] = blocks.flatMap((b) =>
    b.type === "heading" && b.level === 2
      ? [{ id: b.id ?? headingId(b.text), text: b.text }]
      : []
  );

  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-700">
        On this page
      </p>
      <ul className="mt-4 space-y-2.5 border-l border-ink-200">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`-ml-px block border-l-2 pl-4 leading-snug transition ${
                  active
                    ? "border-purple-500 font-medium text-navy-900"
                    : "border-transparent text-ink-500 hover:border-purple-200 hover:text-navy-900"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
