import type { Metadata } from "next";
import { getPublishedMachines } from "@/lib/content/machines";
import { HubBrowser, type HubGroup, type HubItem } from "@/components/site/hub-browser";

export const metadata: Metadata = {
  title: "Devices",
  description:
    "Explore the devices, machines, and brands behind aesthetic treatments. Lasers, energy devices, microneedling, injectable brands and more.",
};

const groups: HubGroup[] = [
  { id: "laser", label: "Lasers", icon: "zap" },
  { id: "energy", label: "Energy & cooling", icon: "layers" },
  { id: "microneedling", label: "Microneedling & RF", icon: "scan" },
  { id: "facial", label: "Facials & devices", icon: "droplet" },
  { id: "brand", label: "Injectable brands", icon: "syringe" },
];

const groupLabelMap: Record<string, string> = {
  laser: "Lasers",
  energy: "Energy & cooling",
  microneedling: "Microneedling & RF",
  facial: "Facials & devices",
  brand: "Injectable brands",
};

function groupFor(category: string, kind: string): HubGroup["id"] {
  if (kind === "brand" || category === "injectable-brand") return "brand";
  switch (category) {
    case "laser":
    case "ipl":
      return "laser";
    case "cryolipolysis":
    case "rf":
    case "ultrasound":
      return "energy";
    case "microneedling-rf":
      return "microneedling";
    case "led":
    case "other":
    default:
      return "facial";
  }
}

const deviceIconMap: Record<string, string> = {
  "soprano-ice-platinum": "zap",
  "candela-gentlemax-pro": "zap",
  picosure: "zap",
  "coolsculpting-elite": "layers",
  morpheus8: "scan",
  "hydrafacial-md": "droplet",
  juvederm: "syringe",
};

export default function MachinesHubPage() {
  const machines = getPublishedMachines();
  const items: HubItem[] = machines.map((m) => {
    const groupId = groupFor(m.category, m.kind);
    return {
      slug: m.slug,
      name: m.name,
      shortDescription: m.shortDescription,
      href: `/machines/${m.slug}`,
      group: groupId,
      groupLabel: groupLabelMap[groupId],
      icon: deviceIconMap[m.slug] ?? "cpu",
      // Surface sub-devices (for brands like Juvederm) or alternate names as chips.
      meta:
        m.subDevices.length > 0
          ? m.subDevices.map((s) => s.name)
          : m.alternateNames.length > 0
            ? [...m.alternateNames]
            : m.manufacturer
              ? [m.manufacturer]
              : [],
      searchTerms: [
        ...m.alternateNames,
        ...m.subDevices.map((s) => s.name),
        ...(m.manufacturer ? [m.manufacturer] : []),
      ],
    };
  });

  // Customer-friendly cycling search words
  const cyclingWords = [
    "juvederm",
    "picosure",
    "coolsculpting",
    "morpheus8",
    "hydrafacial",
    "soprano",
  ];

  return (
    <div className="relative bg-gradient-to-b from-purple-100/50 via-purple-50/40 to-purple-100/30">
      {/* Decorative gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-200/50 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-gradient-to-tl from-purple-300/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[440px] w-[440px] rounded-full bg-gradient-to-tr from-purple-200/40 to-transparent blur-3xl" />
      </div>

      {/* COMPACT HERO - centered on desktop */}
      <section className="relative border-b border-purple-100/60">
        <div className="mx-auto max-w-3xl px-6 pt-12 pb-8 text-left sm:pt-16 sm:pb-10 sm:text-center">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-navy-900 sm:text-4xl md:text-5xl">
            <span className="text-purple-600">Devices</span> we cover
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-ink-600 sm:text-lg">
            The machines, technologies, and product brands behind aesthetic treatments. Search by name or browse by category.
          </p>
        </div>
      </section>

      {/* BROWSER */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6">
          <HubBrowser
            items={items}
            groups={groups}
            searchPlaceholder="Search a device or brand..."
            cyclingWords={cyclingWords}
          />
        </div>
      </section>
    </div>
  );
}
