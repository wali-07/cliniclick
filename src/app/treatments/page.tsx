import type { Metadata } from "next";
import { getPublishedTreatments } from "@/lib/content/treatments";
import { HubBrowser, type HubGroup, type HubItem } from "@/components/site/hub-browser";

export const metadata: Metadata = {
  title: "Treatments",
  description:
    "Explore aesthetic treatments. Injectables, lasers, devices and energy, peels and topicals. What each one does, what it costs, what to ask.",
};

const groups: HubGroup[] = [
  { id: "injectable", label: "Injectables", icon: "syringe" },
  { id: "laser", label: "Lasers", icon: "zap" },
  { id: "device", label: "Devices & energy", icon: "cpu" },
  { id: "peel", label: "Peels & topicals", icon: "droplet" },
];

const groupLabelMap: Record<string, string> = {
  injectable: "Injectables",
  laser: "Lasers",
  device: "Devices & energy",
  peel: "Peels & topicals",
};

const treatmentIconMap: Record<string, string> = {
  botox: "syringe",
  "dermal-fillers": "syringe",
  prp: "syringe",
  "laser-hair-removal": "zap",
  coolsculpting: "layers",
  microneedling: "scan",
  hydrafacial: "droplet",
  "chemical-peels": "flask",
};

function groupFor(category: string): HubGroup["id"] {
  switch (category) {
    case "injectable":
      return "injectable";
    case "laser":
      return "laser";
    case "peel":
    case "topical":
      return "peel";
    case "device":
    case "energy":
    default:
      return "device";
  }
}

export default function TreatmentsHubPage() {
  const treatments = getPublishedTreatments();
  const items: HubItem[] = treatments.map((t) => {
    const groupId = groupFor(t.category);
    return {
      slug: t.slug,
      name: t.name,
      shortDescription: t.shortDescription,
      href: `/treatments/${t.slug}`,
      group: groupId,
      groupLabel: groupLabelMap[groupId],
      icon: treatmentIconMap[t.slug] ?? "activity",
      meta:
        t.subTreatments.length > 0
          ? t.subTreatments.map((s) => s.name)
          : t.alternateNames.length > 0
            ? [...t.alternateNames]
            : [],
      searchTerms: [...t.alternateNames, ...t.subTreatments.map((s) => s.name)],
    };
  });

  // Customer-friendly search terms (what people actually type, not formal names)
  const cyclingWords = [
    "botox",
    "lip fillers",
    "laser hair removal",
    "fat reduction",
    "facial",
    "skin tightening",
    "hair transplant",
  ];

  return (
    <div className="relative bg-gradient-to-b from-purple-100/50 via-purple-50/40 to-purple-100/30">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-200/50 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-gradient-to-tl from-purple-300/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[440px] w-[440px] rounded-full bg-gradient-to-tr from-purple-200/40 to-transparent blur-3xl" />
      </div>

      {/* COMPACT HERO - centered on desktop */}
      <section className="relative border-b border-purple-100/60">
        <div className="mx-auto max-w-3xl px-6 pt-12 pb-8 text-left sm:pt-16 sm:pb-10 sm:text-center">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-navy-900 sm:text-4xl md:text-5xl">
            <span className="text-purple-600">Treatments</span> we cover
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-ink-600 sm:text-lg">
            Browse by category or search a specific treatment. Every entry covers what it does, what it costs, and what to ask before you book.
          </p>
        </div>
      </section>

      {/* BROWSER */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6">
          <HubBrowser
            items={items}
            groups={groups}
            searchPlaceholder="Search a treatment..."
            cyclingWords={cyclingWords}
          />
        </div>
      </section>
    </div>
  );
}
