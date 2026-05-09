import { Eyebrow } from "@/components/content/eyebrow";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Eyebrow axis="guide" />
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
        Privacy
      </h1>
      <p className="mt-6 text-ink-600">
        We&apos;re drafting our full privacy policy. In the meantime: we don&apos;t sell email lists,
        we don&apos;t share personal data with clinics, and we collect only what&apos;s needed to send
        you the content you signed up for and improve the site. Email{" "}
        <a href="mailto:hello@cliniclick.ai" className="text-purple-700 hover:underline">
          hello@cliniclick.ai
        </a>{" "}
        with any questions.
      </p>
    </div>
  );
}
