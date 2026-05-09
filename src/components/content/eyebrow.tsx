import { cn } from "@/lib/utils";

export type EyebrowAxis = "concern" | "treatment" | "machine" | "decoder" | "guide";

const labels: Record<EyebrowAxis, string> = {
  concern: "CONCERN",
  treatment: "TREATMENT",
  machine: "MACHINE",
  decoder: "DECODER",
  guide: "GUIDE",
};

export function Eyebrow({
  axis,
  className,
}: {
  axis: EyebrowAxis;
  className?: string;
}) {
  return (
    <span className={cn("eyebrow", className)} aria-label={`Content type: ${labels[axis]}`}>
      {labels[axis]}
    </span>
  );
}
