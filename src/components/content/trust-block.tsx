import Link from "next/link";
import { formatDate } from "@/lib/utils";

export function TrustBlock({ lastReviewed }: { lastReviewed?: string }) {
  return (
    <aside className="rounded-2xl border border-ink-100 bg-ink-50/60 p-5 text-sm">
      {lastReviewed && (
        <p className="font-medium text-navy-900">Last reviewed: {formatDate(lastReviewed)}</p>
      )}
      <p className="mt-2 text-ink-600">
        We make published medical evidence easy to understand. We don&apos;t give personal medical advice. See our{" "}
        <Link href="/editorial-policy" className="text-purple-700 hover:underline">
          editorial policy
        </Link>
        .
      </p>
    </aside>
  );
}

export function MedicalDisclaimer() {
  return (
    <p className="rounded-lg border-l-4 border-purple-400 bg-purple-50/60 p-4 text-sm text-ink-700">
      <strong className="font-semibold text-navy-900">Information only:</strong>{" "}
      this article is educational and is not medical advice. Always consult a
      qualified, DHA-licensed clinician before starting any treatment.
    </p>
  );
}
