import Link from "next/link";
import { Eyebrow } from "@/components/content/eyebrow";
import { NewsletterSignup } from "@/components/content/newsletter-signup";

export function ComingSoonPage({
  axis,
  title,
  description,
  surface,
}: {
  axis: "concern" | "treatment" | "machine" | "guide";
  title: string;
  description: string;
  surface: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Eyebrow axis={axis} />
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
        {title}
      </h1>
      <p className="mt-6 text-lg text-ink-600">{description}</p>
      <p className="mt-4 text-sm text-ink-500">
        We&apos;re building this carefully - with cited sources, UAE-specific context, and the
        criteria-mode approach that makes the rest of CliniClick worth your time. Want to know the
        moment it&apos;s live?
      </p>
      <div className="mt-8">
        <NewsletterSignup surface={surface} variant="inline" />
      </div>
      <div className="mt-12 border-t border-ink-100 pt-8 text-sm text-ink-600">
        <p>Meanwhile:</p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <li>
            <Link href="/concerns" className="text-purple-700 hover:underline">
              Browse aesthetic concerns →
            </Link>
          </li>
          <li>
            <Link href="/treatments" className="text-purple-700 hover:underline">
              Browse treatments →
            </Link>
          </li>
          <li>
            <Link href="/machines" className="text-purple-700 hover:underline">
              Browse machines →
            </Link>
          </li>
          <li>
            <Link href="/" className="text-purple-700 hover:underline">
              Back to home →
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
