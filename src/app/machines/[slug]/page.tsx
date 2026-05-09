import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMachineBySlug, getPublishedMachines } from "@/lib/content/machines";
import { Eyebrow } from "@/components/content/eyebrow";
import { NewsletterSignup } from "@/components/content/newsletter-signup";

export async function generateStaticParams() {
  return getPublishedMachines().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const machine = getMachineBySlug(slug);
  if (!machine) return {};
  return {
    title: `${machine.name} - coming soon`,
    description: `Our in-depth guide to the ${machine.name} is being researched and written.`,
    robots: { index: false, follow: true },
  };
}

export default async function MachinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const machine = getMachineBySlug(slug);
  if (!machine) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <nav className="text-sm text-ink-500">
        <Link href="/machines" className="hover:text-ink-800">Machines</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-700">{machine.name}</span>
      </nav>

      <Eyebrow axis="machine" className="mt-8 block" />
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
        {machine.name}
      </h1>
      {machine.manufacturer && (
        <p className="mt-2 text-sm uppercase tracking-wider text-ink-500">
          {machine.manufacturer}
        </p>
      )}
      <p className="mt-6 text-lg text-ink-600">
        Our in-depth, independent explainer on {machine.name} is being
        researched and written. We&apos;d rather publish it properly than
        publish it fast.
      </p>
      <p className="mt-4 text-sm text-ink-500">
        It&apos;ll cover what the machine actually is, how it differs from
        comparable devices, who it suits (skin tone, treatment area), the
        evidence base, and the questions to ask if a clinic offers it. Sign up
        below and we&apos;ll email you the moment it&apos;s live.
      </p>
      <div className="mt-10">
        <NewsletterSignup surface={`machine-${machine.slug}`} variant="inline" />
      </div>
      <div className="mt-12 border-t border-ink-100 pt-8 text-sm text-ink-600">
        <p>Meanwhile:</p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <li>
            <Link href="/machines" className="text-purple-700 hover:underline">
              Browse all machines →
            </Link>
          </li>
          <li>
            <Link href="/concerns" className="text-purple-700 hover:underline">
              Browse concerns →
            </Link>
          </li>
          <li>
            <Link href="/treatments" className="text-purple-700 hover:underline">
              Browse treatments →
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
