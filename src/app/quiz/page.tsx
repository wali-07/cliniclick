import { ComingSoonPage } from "@/components/content/coming-soon-page";

export const metadata = {
  title: "Find your treatment in 60 seconds",
  description:
    "Our concern-finder quiz helps you discover the evidence-based treatments that match your goals - coming soon.",
};

export default function QuizPage() {
  return (
    <ComingSoonPage
      axis="guide"
      title="Find your treatment in 60 seconds"
      description="Five to seven quick questions about your concern, your skin tone, and what matters most to you - and we'll suggest evidence-based treatments worth exploring."
      surface="quiz"
    />
  );
}
