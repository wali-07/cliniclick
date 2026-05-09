import { ComingSoonPage } from "@/components/content/coming-soon-page";

export const metadata = {
  title: "Treatment cost calculator - UAE",
  description:
    "Estimate the realistic cost range for any aesthetic treatment in the UAE - sessions, area, complexity - coming soon.",
};

export default function CalculatorPage() {
  return (
    <ComingSoonPage
      axis="guide"
      title="Cost calculator - coming soon"
      description="Sliders for sessions, body area, and complexity - and we'll give you the realistic AED range, with a breakdown of what's actually driving the price."
      surface="calculator"
    />
  );
}
