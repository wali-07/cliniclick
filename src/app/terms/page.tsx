import Link from "next/link";
import {
  FileText,
  Shield,
  Stethoscope,
  Copyright,
  Mail,
  Slash,
  Scale,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "Terms of use",
  description:
    "The basic rules for using cliniclick.ae - what we provide, what you agree to, the limits of our content, and how disputes get handled. Last updated 2026-05-10.",
};

const LAST_UPDATED = "2026-05-10";

export default function TermsPage() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink-100">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-purple-100/60 via-white to-white blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-12 sm:pt-28 sm:pb-16">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-purple-700">
            Terms of use
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-navy-900 sm:text-5xl">
            The rules for using CliniClick
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-600 sm:text-lg">
            Plain-language terms covering what we provide, what you agree to when you use the site, the limits of our content, and how disputes are handled. By using cliniclick.ae you accept these terms.
          </p>
          <p className="mt-4 text-xs text-ink-500">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* BODY */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
          {/* 1 */}
          <SectionHeader icon={FileText} eyebrow="01" title="What CliniClick is and is not" />
          <Prose>
            <p>CliniClick is an independent, evidence-based information service about aesthetic medicine, focused initially on the United Arab Emirates. We publish articles about concerns, treatments, and devices, and (in future) a directory of clinics and a booking layer.</p>
            <p><strong>What we are not:</strong></p>
            <ul>
              <li>Not a medical practice. We do not employ clinicians and we do not provide treatments.</li>
              <li>Not a substitute for a qualified medical opinion. Our content is general information, not personalised medical advice.</li>
              <li>Not a clinic, pharmacy, or supplier. We do not sell or recommend specific products or providers.</li>
            </ul>
          </Prose>

          {/* 2 */}
          <SectionHeader icon={Stethoscope} eyebrow="02" title="Not medical advice" />
          <Prose>
            <p>Everything on cliniclick.ae is for educational purposes. It is not a diagnosis, a treatment plan, or a recommendation about your specific health situation. Read it the way you would read a well-researched magazine article: useful background, not a substitute for talking to a qualified clinician about your own circumstances.</p>
            <p><strong>Always consult a DHA-licensed clinician (or the equivalent regulator in your jurisdiction) before starting, stopping, or changing any treatment.</strong> Do not delay seeking professional advice because of something you read here. If you think you have a medical emergency, contact your local emergency services immediately.</p>
          </Prose>

          {/* 3 */}
          <SectionHeader icon={Shield} eyebrow="03" title="Limitation of liability" />
          <Prose>
            <p>We work hard to make our content accurate and up to date, but we cannot guarantee that every fact, price, or guideline is correct at the moment you read it. To the maximum extent permitted by law:</p>
            <ul>
              <li>We provide cliniclick.ae &ldquo;as is&rdquo; with no warranties of any kind.</li>
              <li>We are not liable for any decision you make based on our content, or for any outcome of any treatment you pursue.</li>
              <li>We are not liable for indirect, incidental, or consequential damages arising from your use of the site.</li>
            </ul>
            <p>Nothing in these terms limits any liability that cannot legally be limited under UAE law.</p>
          </Prose>

          {/* 4 */}
          <SectionHeader icon={Slash} eyebrow="04" title="Acceptable use" />
          <Prose>
            <p>You agree not to:</p>
            <ul>
              <li>Scrape, mirror, or republish our content without written permission</li>
              <li>Use our content to train machine-learning models without written permission</li>
              <li>Try to bypass any technical protection we put in place (rate limiting, authentication, etc.)</li>
              <li>Use the site for spam, harassment, or any unlawful purpose</li>
              <li>Submit false information through any of our forms (notify-me, newsletter, future quiz)</li>
              <li>Attempt to gain unauthorised access to any part of the site, our systems, or other users&apos; data</li>
            </ul>
            <p>If you breach these rules, we may block your access without notice.</p>
          </Prose>

          {/* 5 */}
          <SectionHeader icon={Copyright} eyebrow="05" title="Our content" />
          <Prose>
            <p>The articles, design, brand, code, and database structure of cliniclick.ae are owned by CliniClick. You may:</p>
            <ul>
              <li>Read and share links to our pages</li>
              <li>Quote short excerpts (a few sentences) with attribution and a link back</li>
              <li>Print or save articles for personal use</li>
            </ul>
            <p>You may not republish full articles, sell our content, or build derivative products from it without written permission.</p>
            <p>Where we cite third-party sources (NHS, AAD, journals, etc.), the underlying material remains the property of those publishers and is governed by their own terms.</p>
          </Prose>

          {/* 6 */}
          <SectionHeader icon={Mail} eyebrow="06" title="Newsletter and email" />
          <Prose>
            <p>When you subscribe to the bi-weekly Brief or any other email list, you consent to receive that email until you unsubscribe. Every email includes a one-click unsubscribe link. You can also email <a href="mailto:support@cliniclick.ae">support@cliniclick.ae</a> to be removed.</p>
            <p>We do not sell your email address to anyone, ever. See the <Link href="/privacy">privacy policy</Link> for the full picture.</p>
          </Prose>

          {/* 7 */}
          <SectionHeader icon={AlertCircle} eyebrow="07" title="Changes to the site and these terms" />
          <Prose>
            <p>We may add, remove, or change features at any time without notice. We may also update these terms - if the change is material, we will update the &ldquo;Last updated&rdquo; date at the top and notify subscribers by email.</p>
            <p>If you keep using the site after a material change, that counts as accepting the new terms. If you do not agree, stop using the site.</p>
          </Prose>

          {/* 8 */}
          <SectionHeader icon={Scale} eyebrow="08" title="Governing law" />
          <Prose>
            <p>These terms are governed by the laws of the United Arab Emirates. Any dispute that we cannot resolve directly will be subject to the exclusive jurisdiction of the courts of Dubai, UAE.</p>
            <p>If any part of these terms is found to be unenforceable, the rest still applies.</p>
          </Prose>

          {/* 9 */}
          <SectionHeader icon={Mail} eyebrow="09" title="Contact" />
          <Prose>
            <p>Questions about these terms: <a href="mailto:support@cliniclick.ae">support@cliniclick.ae</a></p>
          </Prose>

          <p className="mt-12 border-t border-ink-100 pt-6 text-xs text-ink-500">
            See also our <Link href="/privacy" className="text-purple-700 hover:underline">privacy policy</Link>, our <Link href="/editorial-policy" className="text-purple-700 hover:underline">editorial policy</Link>, and <Link href="/how-we-write-our-content" className="text-purple-700 hover:underline">how we write our content</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mt-12 flex items-start gap-4 first:mt-0">
      <span
        aria-hidden
        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-purple-50 text-purple-700"
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-700">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-navy-900 sm:text-2xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-sm sm:prose-base mt-4 ml-0 sm:ml-14 max-w-none text-ink-700 prose-a:text-purple-700 prose-strong:text-navy-900 prose-li:my-1">
      {children}
    </div>
  );
}
