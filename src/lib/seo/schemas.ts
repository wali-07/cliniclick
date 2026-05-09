import { siteConfig } from "@/lib/site-config";
import type { Concern, Treatment } from "@/lib/content/types";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [],
    address: {
      "@type": "PostalAddress",
      addressCountry: "AE",
      addressLocality: "Dubai",
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "en-AE",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/learn?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function faqPageSchema(faqs: Array<{ question: string; answer: string }>) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function medicalConditionSchema(concern: Concern) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    name: concern.name,
    description: concern.shortDescription,
    url: `${siteConfig.url}/concerns/${concern.slug}`,
    possibleTreatment: concern.treatmentSlugs.map((slug) => ({
      "@type": "MedicalTherapy",
      name: slug.replace(/-/g, " "),
      url: `${siteConfig.url}/treatments/${slug}`,
    })),
  };
}

export function medicalProcedureSchema(treatment: Treatment) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: treatment.name,
    description: treatment.shortDescription,
    url: `${siteConfig.url}/treatments/${treatment.slug}`,
    procedureType: treatment.category,
    bodyLocation: undefined,
  };
}

export function articleSchema(args: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    url: args.url,
    author: { "@type": "Organization", name: siteConfig.name, url: `${siteConfig.url}${siteConfig.editorial.url}` },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo.png` },
    },
    datePublished: args.datePublished,
    dateModified: args.dateModified ?? args.datePublished,
  };
}
