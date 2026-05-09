import { defineConcern } from "@/lib/content/types";

export const bodyFat = defineConcern({
  slug: "body-fat",
  name: "Stubborn fat & body contouring",
  shortDescription:
    "Pockets of fat that don't respond to diet and exercise - abdomen, thighs, arms, double chin - and the non-surgical treatments that target them.",
  tier: "tier1",
  bodyArea: "body",
  audience: "all",
  treatmentSlugs: ["coolsculpting"],
  subConcerns: [
    { slug: "double-chin", name: "Double chin", shortDescription: "Submental fat below the jawline." },
    { slug: "abdominal-fat", name: "Abdominal fat", shortDescription: "Localised fat on the abdomen, including post-pregnancy." },
    { slug: "thigh-fat", name: "Thigh fat", shortDescription: "Inner and outer thigh fat resistant to lifestyle change." },
  ],
  relatedConcernSlugs: [],
  sources: [],
  published: true,
  lastReviewed: "2026-05-08",
  metaTitle: "Stubborn fat: non-surgical body contouring options",
  metaDescription:
    "Cryolipolysis, injectable fat dissolvers, and other non-surgical fat-reduction treatments - what works and what to expect.",
  faqs: [],
});
