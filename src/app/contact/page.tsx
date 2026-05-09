import { Eyebrow } from "@/components/content/eyebrow";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Eyebrow axis="guide" />
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
        Contact
      </h1>
      <ul className="mt-8 space-y-4 text-ink-700">
        <li>
          <strong className="text-navy-900">General:</strong>{" "}
          <a href="mailto:hello@cliniclick.ai" className="text-purple-700 hover:underline">
            hello@cliniclick.ai
          </a>
        </li>
        <li>
          <strong className="text-navy-900">Corrections / feedback:</strong>{" "}
          <a href="mailto:feedback@cliniclick.ai" className="text-purple-700 hover:underline">
            feedback@cliniclick.ai
          </a>
        </li>
        <li>
          <strong className="text-navy-900">Press:</strong>{" "}
          <a href="mailto:press@cliniclick.ai" className="text-purple-700 hover:underline">
            press@cliniclick.ai
          </a>
        </li>
      </ul>
    </div>
  );
}
