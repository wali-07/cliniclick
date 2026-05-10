import Link from "next/link";
import { ShieldCheck, Mail, Database, Globe2, Eye, Trash2, Cookie, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Privacy",
  description:
    "What CliniClick collects, why, who we share it with, how long we keep it, and your rights over your data. UAE PDPA-aligned. Last updated 2026-05-10.",
};

const LAST_UPDATED = "2026-05-10";

export default function PrivacyPage() {
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
            Privacy
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-navy-900 sm:text-5xl">
            What we collect, why, and your rights over it
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-600 sm:text-lg">
            CliniClick is operated from the UAE. This policy explains the data we collect through cliniclick.ae, why we collect it, who we share it with, and how you can ask us to change or delete it.
          </p>
          <p className="mt-4 text-xs text-ink-500">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* BODY */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
          {/* Section 1 */}
          <SectionHeader icon={Database} eyebrow="01" title="What we collect" />
          <Prose>
            <p>We try to collect as little as possible. The categories of personal data we hold:</p>
            <ul>
              <li><strong>Email address</strong> when you submit one of our forms (newsletter signup, &ldquo;notify me when bookings launch&rdquo;, future quiz). We capture the email itself plus a tag noting which form it came from (e.g. &ldquo;newsletter:homepage&rdquo;).</li>
              <li><strong>Server logs</strong> generated automatically when you visit the site - IP address, browser user-agent, the page you visited, and a timestamp. These are kept by our hosting provider for operational purposes (security, debugging, basic traffic patterns).</li>
              <li><strong>Analytics</strong> - we currently do NOT run Google Analytics, Microsoft Clarity, or any other third-party tracking on cliniclick.ae. If we add any in future, this policy will be updated and the relevant cookies disclosed before the tools go live.</li>
            </ul>
            <p>We do <strong>not</strong> collect: payment data, government-issued ID, location beyond what your IP reveals, anything from social networks, or any &ldquo;sensitive personal data&rdquo; categories under UAE PDPA (health data, biometrics, religious or political views).</p>
          </Prose>

          {/* Section 2 */}
          <SectionHeader icon={Mail} eyebrow="02" title="Why we collect it" />
          <Prose>
            <ul>
              <li><strong>Email</strong> - to send you the newsletter and updates you signed up for, and to notify you when the directory and booking features launch. Lawful basis under UAE PDPA: your consent (you submitted the form).</li>
              <li><strong>Server logs</strong> - to keep the site running (security, error diagnosis, abuse prevention, basic traffic analysis). Lawful basis: legitimate interest in operating a working website.</li>
            </ul>
          </Prose>

          {/* Section 3 */}
          <SectionHeader icon={Globe2} eyebrow="03" title="Who we share it with" />
          <Prose>
            <p>We use a small number of trusted third-party service providers to operate the site (hosting, email delivery, domain infrastructure). Each receives only the minimum data needed to do its job, and each is contractually bound to handle your data securely and only on our instructions.</p>
            <p>We do <strong>not</strong> sell your data, share it with clinics, or pass it to advertising networks. None of our content placements are paid - we have no commercial reason to share visitor lists.</p>
          </Prose>

          {/* Section 4 */}
          <SectionHeader icon={Trash2} eyebrow="04" title="How long we keep it" />
          <Prose>
            <ul>
              <li><strong>Email subscribers</strong> - until you unsubscribe (every email has a one-click unsubscribe link) or you ask us to delete your record.</li>
              <li><strong>Server logs</strong> - kept by our hosting provider for up to 30 days, then automatically purged.</li>
              <li><strong>Unsubscribed records</strong> - we retain a hashed marker so we know not to add you back, but the original email address is removed.</li>
            </ul>
          </Prose>

          {/* Section 5 */}
          <SectionHeader icon={Eye} eyebrow="05" title="Your rights" />
          <Prose>
            <p>Under UAE PDPA (Federal Decree-Law No. 45 of 2021) and equivalent regulations in other regions, you have the right to:</p>
            <ul>
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Correct</strong> data that is inaccurate</li>
              <li><strong>Delete</strong> your data (&ldquo;right to be forgotten&rdquo;)</li>
              <li><strong>Object</strong> to processing for marketing purposes (one-click unsubscribe in every email)</li>
              <li><strong>Data portability</strong> - receive a copy of your data in a common format</li>
              <li><strong>Withdraw consent</strong> at any time, with no penalty</li>
            </ul>
            <p>To exercise any of these, email <a href="mailto:support@cliniclick.ae">support@cliniclick.ae</a>. We aim to respond within 7 days and complete deletions within 30 days. There is no charge.</p>
          </Prose>

          {/* Section 6 */}
          <SectionHeader icon={Cookie} eyebrow="06" title="Cookies and tracking" />
          <Prose>
            <p>We do not currently set any first-party cookies on cliniclick.ae. Our hosting provider (Vercel) may set short-lived session cookies for security and load balancing - these are essential for the site to work and do not track you across other websites.</p>
            <p>If we add analytics (Google Analytics, Microsoft Clarity, or similar) in future, this section will be updated to disclose the cookies set, what they collect, and how to opt out, before the tools go live.</p>
          </Prose>

          {/* Section 7 */}
          <SectionHeader icon={Globe2} eyebrow="07" title="International visitors" />
          <Prose>
            <p>If you are visiting from the EU, UK, or another region with stricter data-protection laws than the UAE, the GDPR and your local equivalents apply to your data. The rights and protections in this policy meet or exceed those requirements.</p>
            <p>Some of our service providers operate from outside the UAE. By using cliniclick.ae you consent to your data being processed in those locations under appropriate cross-border safeguards.</p>
          </Prose>

          {/* Section 8 */}
          <SectionHeader icon={AlertCircle} eyebrow="08" title="Changes to this policy" />
          <Prose>
            <p>If we change this policy in any material way, we will update the &ldquo;Last updated&rdquo; date at the top and email subscribers a summary of what changed. Minor wording corrections are made silently.</p>
          </Prose>

          {/* Section 9 */}
          <SectionHeader icon={ShieldCheck} eyebrow="09" title="Contact" />
          <Prose>
            <p>For any question about this policy or your data: <a href="mailto:support@cliniclick.ae">support@cliniclick.ae</a>.</p>
            <p>If you believe we have violated UAE data-protection law and we have not resolved your complaint, you can escalate to the UAE Data Office (the federal regulator under PDPA).</p>
          </Prose>

          <p className="mt-12 border-t border-ink-100 pt-6 text-xs text-ink-500">
            See also our <Link href="/terms" className="text-purple-700 hover:underline">terms of use</Link> and our <Link href="/editorial-policy" className="text-purple-700 hover:underline">editorial policy</Link>.
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
