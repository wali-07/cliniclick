import type { Metadata } from "next";
import { getPublishedConcerns } from "@/lib/content/concerns";
import { HubBrowser, type HubGroup, type HubItem } from "@/components/site/hub-browser";

export const metadata: Metadata = {
  title: "Concerns",
  description:
    "Explore aesthetic concerns. Skin, face & features, hair, and body. Find what you're looking for and the treatments that address it.",
};

const groups: HubGroup[] = [
  { id: "skin", label: "Skin", icon: "sparkles" },
  { id: "face", label: "Face & features", icon: "eye" },
  { id: "hair", label: "Hair", icon: "wand" },
  { id: "body", label: "Body & shape", icon: "user" },
];

const concernMap: Record<string, { group: HubGroup["id"]; icon: string; groupLabel: string }> = {
  acne: { group: "skin", icon: "sparkles", groupLabel: "Skin" },
  pigmentation: { group: "skin", icon: "droplet", groupLabel: "Skin" },
  "wrinkles-and-fine-lines": { group: "skin", icon: "activity", groupLabel: "Skin" },
  "under-eye-concerns": { group: "face", icon: "eye", groupLabel: "Face & features" },
  "hair-loss": { group: "hair", icon: "wand", groupLabel: "Hair" },
  "unwanted-hair": { group: "hair", icon: "scissors", groupLabel: "Hair" },
  "body-fat": { group: "body", icon: "user", groupLabel: "Body & shape" },
};

export default function ConcernsHubPage() {
  const concerns = getPublishedConcerns();
  const items: HubItem[] = concerns.map((c) => {
    const map = concernMap[c.slug] ?? { group: "skin" as const, icon: "heart", groupLabel: "Skin" };
    return {
      slug: c.slug,
      name: c.name,
      shortDescription: c.shortDescription,
      href: `/concerns/${c.slug}`,
      group: map.group,
      groupLabel: map.groupLabel,
      icon: map.icon,
      meta: c.subConcerns.map((s) => s.name),
      searchTerms: c.subConcerns.map((s) => s.name),
    };
  });

  // Words the search placeholder cycles through - phrased the way real customers
  // would type them, not the formal medical names.
  const cyclingWords = [
    "acne scars",
    "dark spots",
    "hair removal",
    "double chin",
    "hair loss",
    "wrinkles",
    "dark under-eyes",
  ];

  return (
    <div className="relative bg-gradient-to-b from-purple-100/50 via-purple-50/40 to-purple-100/30">
      {/* Decorative gradient blobs - kept in their own overflow-hidden wrapper
          so position:sticky inside the page still works against the viewport. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-200/50 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-gradient-to-tl from-purple-300/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[440px] w-[440px] rounded-full bg-gradient-to-tr from-purple-200/40 to-transparent blur-3xl" />
      </div>

      {/* COMPACT HERO - centered on desktop to align with the centered search */}
      <section className="relative border-b border-purple-100/60">
        <div className="mx-auto max-w-3xl px-6 pt-12 pb-8 text-left sm:pt-16 sm:pb-10 sm:text-center">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-navy-900 sm:text-4xl md:text-5xl">
            <span className="text-purple-600">Concerns</span> we cover
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-ink-600 sm:text-lg">
            Browse by category or search to find your concern, then dive into the treatments and devices that address it.
          </p>
        </div>
      </section>

      {/* BROWSER */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6">
          <HubBrowser
            items={items}
            groups={groups}
            searchPlaceholder="Search a concern..."
            cyclingWords={cyclingWords}
          />
        </div>
      </section>
    </div>
  );
}
