import { ComingSoonPage } from "@/components/content/coming-soon-page";

export const metadata = {
  title: "Guides",
  description:
    "Practical guides for navigating aesthetic medicine - pricing, licensing, what to ask in a consultation, and other things worth knowing before you book.",
};

export default function LearnHubPage() {
  return (
    <ComingSoonPage
      axis="guide"
      title="Guides - coming soon"
      description="Practical reads that change how you walk into your next consultation. How aesthetic pricing actually works, how to verify a license, how to read a clinic's claims, and more."
      surface="learn-hub"
    />
  );
}
