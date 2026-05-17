import type { Metadata } from "next";
import { getArticlesForParent, getPublishedGuides } from "@/lib/content/articles";
import { QuizFlow, type QuizData, type ReadCard } from "@/components/site/quiz-flow";

export const metadata: Metadata = {
  title: "Which aesthetic concern should you read up on?",
  description:
    "Answer a few quick questions and we'll point you to honest, evidence-based articles about your concern. Educational only - not medical or treatment advice.",
  alternates: { canonical: "/quiz" },
};

/**
 * Concern-router quiz. Questions first, then an email gate, then a reading
 * list of ARTICLES for the matched concern. It never recommends or ranks
 * treatments or clinics - it is an educational article finder (criteria
 * mode, not medical advice), per the locked editorial rules.
 */

// Customer-language label -> concern parentSlug in the content layer.
const CONCERNS: { value: string; label: string; slug: string }[] = [
  { value: "acne", label: "Breakouts and acne", slug: "acne" },
  { value: "pigmentation", label: "Dark spots and uneven tone", slug: "pigmentation" },
  { value: "wrinkles", label: "Lines and wrinkles", slug: "wrinkles-and-fine-lines" },
  { value: "under-eye", label: "Under-eye circles or puffiness", slug: "under-eye-concerns" },
  { value: "hair-loss", label: "Hair loss or thinning", slug: "hair-loss" },
  { value: "unwanted-hair", label: "Unwanted or excess hair", slug: "unwanted-hair" },
  { value: "body-fat", label: "Stubborn body fat", slug: "body-fat" },
];

export default function QuizPage() {
  const guides: ReadCard[] = getPublishedGuides().map((a) => ({
    title: a.title,
    dek: a.dek,
    href: `/learn/${a.slug}`,
    kind: "Guide",
  }));

  const results: QuizData["results"] = {};
  for (const c of CONCERNS) {
    const articles: ReadCard[] = getArticlesForParent({
      parentType: "concern",
      parentSlug: c.slug,
    }).map((a) => ({
      title: a.title,
      dek: a.dek,
      href: `/concerns/${c.slug}/${a.slug}`,
      kind: "Article",
    }));
    results[c.value] = { label: c.label, articles };
  }

  const data: QuizData = {
    concerns: CONCERNS.map(({ value, label }) => ({ value, label })),
    results,
    guides,
  };

  return (
    <div className="relative bg-gradient-to-b from-purple-100/30 via-white to-purple-50/40">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <QuizFlow data={data} />
      </div>
    </div>
  );
}
