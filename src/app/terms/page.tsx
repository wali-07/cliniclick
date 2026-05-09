import { Eyebrow } from "@/components/content/eyebrow";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Eyebrow axis="guide" />
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
        Terms
      </h1>
      <p className="mt-6 text-ink-600">
        Information on CliniClick is for educational purposes only and is not medical advice. Always
        consult a DHA-licensed clinician before starting any treatment. Full terms of service are
        being drafted.
      </p>
    </div>
  );
}
