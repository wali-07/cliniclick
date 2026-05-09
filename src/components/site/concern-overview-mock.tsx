/**
 * Visual mockup of an in-depth "What is X" article preview.
 * Used in the Understand section of concern detail pages, mirroring the
 * show-don't-tell approach of ArticlePreviewMock on the homepage.
 */
import { BookOpen } from "lucide-react";

export function ConcernOverviewMock({ concernName }: { concernName: string }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-purple-200/40 via-purple-100/20 to-transparent blur-2xl"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 translate-x-4 translate-y-4 -rotate-1 rounded-3xl border border-ink-100 bg-white opacity-60 shadow-[0_10px_40px_rgba(0,20,53,0.06)]"
      />

      <article className="relative rounded-3xl border border-ink-100 bg-white p-7 shadow-[0_18px_50px_rgba(0,20,53,0.08)] sm:p-9">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-purple-300 bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700">
            <BookOpen className="h-3 w-3" aria-hidden />
            OVERVIEW · 8 MIN READ
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">
            cliniclick.ae
          </span>
        </div>

        <h3 className="mt-5 text-xl font-semibold leading-snug tracking-[-0.01em] text-navy-900 sm:text-2xl">
          What is {concernName.toLowerCase()} - the plain explanation
        </h3>
        <p className="mt-2 text-xs text-ink-500">Last reviewed today · Independent</p>

        <div className="mt-6 space-y-3 text-sm leading-relaxed text-ink-700">
          <p>
            A clear, evidence-based starting point. What it actually is, what causes it,
            and why your particular case might look the way it does.
          </p>
          <p>
            With{" "}
            <span className="rounded bg-purple-50 px-1 text-purple-800 underline decoration-purple-300 underline-offset-2">
              cited sources
            </span>
            <sup className="ml-0.5 text-purple-600">[1]</sup>{" "}
            from authorities like NHS, Mayo Clinic, and AAD. Not from clinic blogs.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-500">
            Inside:
          </span>
          {["Causes", "Severity", "When to see a clinician", "Sources"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-ink-200 px-2.5 py-0.5 text-[11px] font-medium text-ink-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}
