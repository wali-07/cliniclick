import type { Article } from "@/lib/content/types";
import { getConcernBySlug } from "@/lib/content/concerns";
import { getTreatmentBySlug } from "@/lib/content/treatments";
import { getMachineBySlug } from "@/lib/content/machines";
import { getArticlesForParent } from "@/lib/content/articles";

type ParentType = Article["parentType"];

/**
 * The set of article slugs a parent hub is allowed to link to. Anything in
 * this set renders either the published article OR a graceful coming-soon
 * page; anything NOT in this set is a genuine 404.
 *
 * This is what keeps the URL space bounded: the site never hard-404s a link
 * it generates itself (per the locked design decision - unwritten article
 * sub-pages render coming-soon, not notFound), but a random/garbage slug
 * still 404s so we never index infinite thin pages.
 */
export function getExpectedArticleSlugs(
  parentType: ParentType,
  parentSlug: string
): Set<string> {
  const slugs = new Set<string>();

  // Every published article under this parent is, by definition, expected.
  for (const a of getArticlesForParent({ parentType, parentSlug })) {
    slugs.add(a.slug);
  }

  // Every parent has a canonical "What is X" overview as its primary entry.
  slugs.add(`what-is-${parentSlug}`);

  if (parentType === "concern") {
    const concern = getConcernBySlug(parentSlug);
    concern?.subConcerns.forEach((s) => slugs.add(s.slug));
  } else if (parentType === "treatment") {
    const treatment = getTreatmentBySlug(parentSlug);
    treatment?.subTreatments.forEach((s) => slugs.add(s.slug));
    // Comparison spokes live as `vs-{otherTreatmentSlug}` under the treatment.
    treatment?.comparisonSlugs.forEach((other) => slugs.add(`vs-${other}`));
  } else if (parentType === "machine") {
    const machine = getMachineBySlug(parentSlug);
    machine?.subDevices.forEach((s) => slugs.add(s.slug));
  }

  return slugs;
}

/**
 * Resolve the canonical href for a treatment-vs-treatment comparison.
 *
 * Comparison articles live at /treatments/{parent}/vs-{other}. The article
 * can be authored under either treatment, so we look in both directions and
 * fall back to the canonical (a, vs-b) form, which the route renders as a
 * coming-soon page until the article is written.
 */
export function resolveComparisonHref(slugA: string, slugB: string): string {
  const aHasIt = getArticlesForParent({
    parentType: "treatment",
    parentSlug: slugA,
  }).some((x) => x.slug === `vs-${slugB}`);
  if (aHasIt) return `/treatments/${slugA}/vs-${slugB}`;

  const bHasIt = getArticlesForParent({
    parentType: "treatment",
    parentSlug: slugB,
  }).some((x) => x.slug === `vs-${slugA}`);
  if (bHasIt) return `/treatments/${slugB}/vs-${slugA}`;

  // Neither published yet - canonical form; route renders coming-soon.
  return `/treatments/${slugA}/vs-${slugB}`;
}

/**
 * Best-effort human title for a not-yet-written article, derived from its
 * slug. Used by the coming-soon page when there's no Article record yet.
 */
export function titleFromSlug(slug: string): string {
  if (slug.startsWith("what-is-")) {
    const rest = slug.slice("what-is-".length).replace(/-/g, " ");
    return `What is ${rest}`;
  }
  if (slug.startsWith("vs-")) {
    const rest = slug.slice("vs-".length).replace(/-/g, " ");
    return `Compared with ${rest}`;
  }
  const words = slug.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
