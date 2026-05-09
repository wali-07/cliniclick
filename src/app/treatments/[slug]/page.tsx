import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getTreatmentBySlug,
  getPublishedTreatments,
} from "@/lib/content/treatments";
import { Eyebrow } from "@/components/content/eyebrow";
import { NewsletterSignup } from "@/components/content/newsletter-signup";

export async function generateStaticParams() {
  return getPublishedTreatments().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const treatment = getTreatmentBySlug(slug);
  if (!treatment) return {};
  return {
    title: `${treatment.name} - coming soon`,
    description: `Our in-depth guide to ${treatment.name.toLowerCase()} in the UAE is being researched and written.`,
    robots: { index: false, follow: true },
  };
}

export default async function TreatmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const treatment = getTreatmentBySlug(slug);
  if (!treatment) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <nav className="text-sm text-ink-500">
        <Link href="/treatments" className="hover:text-ink-800">Treatments</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-700">{treatment.name}</span>
      </nav>

      <Eyebrow axis="treatment" className="mt-8 block" />
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
        {treatment.name}
      </h1>
      <p className="mt-6 text-lg text-ink-600">
        Our in-depth, evidence-based guide to {treatment.name.toLowerCase()} is
        being researched and written. We&apos;d rather publish it properly than
        publish it fast.
      </p>
      <p className="mt-4 text-sm text-ink-500">
        It&apos;ll cover how it actually works, what concerns it addresses, the
        procedure journey, sessions, results timelines, risks, what it costs in
        AED, the machines clinics typically use, and the questions to ask.
        Sign up below and we&apos;ll email you the moment it&apos;s live.
      </p>
      <div className="mt-10">
        <NewsletterSignup surface={`treatment-${treatment.slug}`} variant="inline" />
      </div>
      <div className="mt-12 border-t border-ink-100 pt-8 text-sm text-ink-600">
        <p>Meanwhile:</p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <li>
            <Link href="/treatments" className="text-purple-700 hover:underline">
              Browse all treatments →
            </Link>
          </li>
          <li>
            <Link href="/concerns" className="text-purple-700 hover:underline">
              Browse concerns →
            </Link>
          </li>
          <li>
            <Link href="/machines" className="text-purple-700 hover:underline">
              Browse machines →
            </Link>
          </li>
          <li>
            <Link href="/how-we-write-our-content" className="text-purple-700 hover:underline">
              How we write our content →
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
