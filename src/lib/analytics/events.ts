declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export type AnalyticsEvent =
  | { event: "view_concern"; concern_slug: string }
  | { event: "view_treatment"; treatment_slug: string }
  | { event: "view_comparison"; treatment_a: string; treatment_b: string }
  | { event: "view_glossary_term"; term: string }
  | { event: "scroll_depth_50"; path: string }
  | { event: "scroll_depth_90"; path: string }
  | { event: "read_complete"; path: string }
  | { event: "related_clicked"; from: string; to: string }
  | { event: "quiz_started" }
  | { event: "quiz_completed"; result_concern?: string; result_treatments: string[] }
  | { event: "concern_to_treatment_clicked"; concern_slug: string; treatment_slug: string }
  | { event: "treatment_to_concern_clicked"; treatment_slug: string; concern_slug: string }
  | { event: "clinic_card_viewed"; clinic_slug: string }
  | { event: "clinic_outbound_clicked"; clinic_slug: string }
  | { event: "book_intent"; treatment_slug: string }
  | { event: "newsletter_signup"; source: string }
  | { event: "notify_when_bookings_live"; treatment_slug?: string }
  | { event: "quiz_results_emailed" };

export function track(payload: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}
