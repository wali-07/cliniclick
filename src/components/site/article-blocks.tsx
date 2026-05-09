import Link from "next/link";
import Image from "next/image";
import { Info, AlertTriangle, NotebookPen, MapPin, Check } from "lucide-react";
import type { ArticleBlock } from "@/lib/content/types";
import { headingId } from "@/lib/content/articles";

/**
 * Inline-text renderer. Supports a small markdown subset on paragraph / list /
 * callout / quote / table cell text:
 *   **bold**
 *   [link text](https://...)
 *   [^N]   - reference to the N-th item in the article's sources array (1-indexed)
 *
 * Citations render as a superscript chip that anchors to #source-N at the
 * bottom of the article. Anything outside this subset is rendered as plain text.
 */
function renderInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const pattern =
    /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|(\[\^\d+\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      tokens.push(
        <strong key={`b-${key++}`} className="font-semibold text-navy-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("[^")) {
      const n = token.slice(2, -1);
      tokens.push(
        <a
          key={`c-${key++}`}
          href={`#source-${n}`}
          aria-label={`Source ${n}`}
          className="ml-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-md bg-purple-100 px-1 text-[10px] font-semibold text-purple-700 align-super no-underline transition hover:bg-purple-200"
        >
          {n}
        </a>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isExternal = href.startsWith("http");
        tokens.push(
          <Link
            key={`l-${key++}`}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="text-purple-700 underline decoration-purple-200 underline-offset-2 transition hover:decoration-purple-500"
          >
            {label}
          </Link>
        );
      }
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

const calloutVariants = {
  info: {
    icon: Info,
    border: "border-purple-200",
    bg: "bg-purple-50/60",
    iconBg: "bg-purple-100 text-purple-700",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-200",
    bg: "bg-amber-50/70",
    iconBg: "bg-amber-100 text-amber-700",
  },
  note: {
    icon: NotebookPen,
    border: "border-ink-200",
    bg: "bg-ink-50/70",
    iconBg: "bg-ink-100 text-ink-700",
  },
  context: {
    icon: MapPin,
    border: "border-purple-200",
    bg: "bg-gradient-to-br from-purple-50 to-white",
    iconBg: "bg-white text-purple-700",
  },
} as const;

export function ArticleBlocks({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-7">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const id = block.id ?? headingId(block.text);
            if (block.level === 2) {
              return (
                <h2
                  key={i}
                  id={id}
                  className="scroll-mt-28 pt-6 text-2xl font-semibold tracking-[-0.015em] text-navy-900 sm:text-[28px]"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={i}
                id={id}
                className="scroll-mt-28 pt-2 text-lg font-semibold tracking-tight text-navy-900 sm:text-xl"
              >
                {block.text}
              </h3>
            );
          }

          case "paragraph":
            return (
              <p
                key={i}
                className="text-[17px] leading-[1.7] text-ink-700 sm:text-[18px]"
              >
                {renderInline(block.text)}
              </p>
            );

          case "list": {
            if (block.style === "number") {
              return (
                <ol
                  key={i}
                  className="space-y-3 pl-1 text-[17px] leading-[1.65] text-ink-700 sm:text-[18px]"
                >
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-[12px] font-semibold text-purple-700"
                      >
                        {j + 1}
                      </span>
                      <span className="flex-1">{renderInline(item)}</span>
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul
                key={i}
                className="space-y-2.5 text-[17px] leading-[1.65] text-ink-700 sm:text-[18px]"
              >
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-[0.7em] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500"
                    />
                    <span className="flex-1">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          case "callout": {
            const v = calloutVariants[block.variant];
            const Icon = v.icon;
            return (
              <aside
                key={i}
                className={`rounded-2xl border ${v.border} ${v.bg} p-5 sm:p-6`}
              >
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl ${v.iconBg}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    {block.title && (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                        {block.title}
                      </p>
                    )}
                    <p
                      className={`${
                        block.title ? "mt-1.5" : ""
                      } text-[15px] leading-[1.65] text-ink-700 sm:text-base`}
                    >
                      {renderInline(block.text)}
                    </p>
                  </div>
                </div>
              </aside>
            );
          }

          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-purple-300 pl-5 text-[19px] italic leading-[1.55] text-navy-900 sm:text-xl"
              >
                <p>{renderInline(block.text)}</p>
                {block.attribution && (
                  <footer className="mt-2 text-sm not-italic text-ink-500">
                    {block.attribution}
                  </footer>
                )}
              </blockquote>
            );

          case "table":
            return (
              <figure key={i} className="overflow-hidden rounded-2xl border border-ink-200">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm sm:text-[15px]">
                    <thead className="bg-purple-50/70 text-navy-900">
                      <tr>
                        {block.headers.map((h, j) => (
                          <th
                            key={j}
                            className="px-4 py-3 font-semibold tracking-tight first:pl-5 last:pr-5"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 bg-white text-ink-700">
                      {block.rows.map((row, j) => (
                        <tr key={j}>
                          {row.map((cell, k) => (
                            <td
                              key={k}
                              className="px-4 py-3 align-top leading-relaxed first:pl-5 last:pr-5"
                            >
                              {renderInline(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {block.caption && (
                  <figcaption className="border-t border-ink-100 bg-ink-50/60 px-5 py-2 text-xs text-ink-500">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "checklist":
            return (
              <div
                key={i}
                className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-6"
              >
                {block.title && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                    {block.title}
                  </p>
                )}
                <ul className={`${block.title ? "mt-3" : ""} space-y-3`}>
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-3 text-[15px] leading-relaxed text-ink-700 sm:text-base">
                      <span
                        aria-hidden
                        className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border border-purple-200 bg-purple-50 text-purple-700"
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{renderInline(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );

          case "image":
            return (
              <figure key={i} className="overflow-hidden rounded-2xl border border-ink-100">
                <div className="relative aspect-[16/9] w-full bg-ink-50">
                  <Image
                    src={block.src}
                    alt={block.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                </div>
                {block.caption && (
                  <figcaption className="border-t border-ink-100 px-5 py-3 text-xs text-ink-500">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
