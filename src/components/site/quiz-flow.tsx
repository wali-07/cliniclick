"use client";

/**
 * Concern-router quiz: answer questions first, then an email gate, then a
 * reading list of ARTICLES for the matched concern. Compliance-locked:
 * never recommends/ranks treatments or clinics, never gives medical advice -
 * it is an educational article finder (criteria mode). See the editorial
 * rules in memory.
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, RotateCcw } from "lucide-react";

export type ReadCard = {
  title: string;
  dek: string;
  href: string;
  kind: "Article" | "Guide";
};

export type QuizData = {
  concerns: { value: string; label: string }[];
  results: Record<string, { label: string; articles: ReadCard[] }>;
  guides: ReadCard[];
};

type Question = {
  id: string;
  prompt: string;
  options: { value: string; label: string }[];
};

const STATIC_QUESTIONS: Question[] = [
  {
    id: "area",
    prompt: "Where is it mostly?",
    options: [
      { value: "face", label: "On my face" },
      { value: "body", label: "On my body" },
      { value: "scalp", label: "On my scalp or hairline" },
      { value: "mix", label: "A mix of areas" },
    ],
  },
  {
    id: "timeframe",
    prompt: "How long has it been on your mind?",
    options: [
      { value: "new", label: "Just starting to look into it" },
      { value: "while", label: "A while now" },
      { value: "serious", label: "I'm ready to take it seriously" },
    ],
  },
  {
    id: "want",
    prompt: "Right now, you mostly want to",
    options: [
      { value: "understand", label: "Understand what it actually is" },
      { value: "options", label: "Know what the general options are" },
      { value: "costs", label: "Get a feel for typical costs" },
    ],
  },
  {
    id: "depth",
    prompt: "How do you like to learn?",
    options: [
      { value: "quick", label: "A quick overview" },
      { value: "deep", label: "Go in depth" },
    ],
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function QuizFlow({ data }: { data: QuizData }) {
  const questions: Question[] = [
    {
      id: "concern",
      prompt: "What would you most like to understand better?",
      options: data.concerns,
    },
    ...STATIC_QUESTIONS,
  ];

  const [step, setStep] = useState(0); // 0..questions.length-1 = Qs
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"questions" | "email" | "results">(
    "questions"
  );
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function choose(qid: string, value: string) {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setPhase("email");
    }
  }

  function back() {
    setError("");
    if (phase === "email") {
      setPhase("questions");
      setStep(questions.length - 1);
    } else if (step > 0) {
      setStep(step - 1);
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, surface: "quiz" }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && body.ok) {
        setPhase("results");
      } else {
        setError(body.error ?? "Something went wrong - please try again");
      }
    } catch {
      setError("Network error - please try again");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setPhase("questions");
    setEmail("");
    setError("");
  }

  const eyebrow = (
    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
      Reading-list finder
    </span>
  );

  // ---- Questions ----
  if (phase === "questions") {
    const q = questions[step];
    return (
      <div>
        {eyebrow}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-purple-100">
            <div
              className="h-full rounded-full bg-purple-500 transition-all"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-ink-500">
            {step + 1} / {questions.length}
          </span>
        </div>
        <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.02em] text-navy-900 sm:text-4xl">
          {q.prompt}
        </h1>
        <ul className="mt-8 space-y-3">
          {q.options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => choose(q.id, opt.value)}
                className="group flex w-full items-center justify-between rounded-2xl border border-ink-200 bg-white px-6 py-4 text-left text-base font-medium text-navy-900 transition hover:border-purple-300 hover:shadow-[0_12px_40px_rgba(167,92,255,0.10)]"
              >
                {opt.label}
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-purple-600" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="mt-8 text-sm font-medium text-ink-500 transition hover:text-navy-900"
          >
            Back
          </button>
        )}
      </div>
    );
  }

  // ---- Email gate ----
  if (phase === "email") {
    return (
      <div>
        {eyebrow}
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] text-navy-900 sm:text-4xl">
          Your reading list is ready
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
          Pop in your email and we&apos;ll show your articles now - plus you&apos;ll
          get our honest bi-weekly Brief. No spam, unsubscribe anytime.
        </p>
        <form onSubmit={submitEmail} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="quiz-email" className="sr-only">
            Your email
          </label>
          <input
            id="quiz-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border border-ink-200 bg-white px-6 py-3.5 text-sm text-ink-900 placeholder-ink-400 focus:border-purple-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
          >
            {submitting ? "..." : "See my reading list"}
          </button>
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={back}
          className="mt-8 text-sm font-medium text-ink-500 transition hover:text-navy-900"
        >
          Back
        </button>
      </div>
    );
  }

  // ---- Results ----
  const concern = answers.concern;
  const result = data.results[concern];
  const concernCards = result?.articles ?? [];
  const wantCosts = answers.want === "costs";
  const cards: ReadCard[] = wantCosts
    ? [...data.guides, ...concernCards]
    : [...concernCards, ...data.guides];

  return (
    <div>
      {eyebrow}
      <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] text-navy-900 sm:text-4xl">
        Start here: {result?.label.toLowerCase() ?? "your concern"}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
        Honest, evidence-based reading to help you understand it on your own
        terms - before you talk to anyone.
      </p>

      <ul className="mt-10 space-y-4">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(167,92,255,0.10)]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                {c.kind}
              </span>
              <span className="mt-2 text-lg font-semibold tracking-tight text-navy-900">
                {c.title}
              </span>
              <span className="mt-1.5 text-sm leading-relaxed text-ink-600">
                {c.dek}
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 transition group-hover:gap-2">
                Read it
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <aside className="mt-10 flex items-start gap-3 rounded-2xl border-l-4 border-purple-300 bg-white px-5 py-4">
        <p className="text-xs leading-relaxed text-ink-600">
          <span className="font-medium text-navy-900">
            Information only - not medical advice.
          </span>{" "}
          This is a reading guide to help you learn, not a treatment
          recommendation. For anything about your own skin or care, see a
          DHA-licensed clinician.
        </p>
      </aside>

      <button
        type="button"
        onClick={restart}
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-navy-900"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        Start over
      </button>
    </div>
  );
}
