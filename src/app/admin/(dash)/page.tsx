import {
  getSeoCalendar,
  nextUp,
  type SeoEntry,
  type SeoStatus,
} from "@/lib/admin/calendars";
import {
  CalendarBoard,
  type BoardRow,
  type Tone,
} from "@/components/admin/calendar-board";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TONE: Record<SeoStatus, Tone> = {
  queued: "grey",
  drafting: "blue",
  "in-review": "amber",
  "awaiting-approval": "amber",
  approved: "purple",
  published: "green",
  rejected: "red",
  skipped: "grey",
};
const LABEL: Record<SeoStatus, string> = {
  queued: "Queued",
  drafting: "Drafting",
  "in-review": "In review",
  "awaiting-approval": "Awaiting approval",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
  skipped: "Skipped",
};

function toRow(e: SeoEntry): BoardRow {
  return {
    id: e.slug,
    date: e.publishedDate ?? e.dueDate,
    title: e.title,
    sub: `${e.kind} · ${e.parentType}/${e.parentSlug}`,
    statusLabel: LABEL[e.status],
    tone: TONE[e.status],
    notes: e.notes,
  };
}

export default function AdminSeoPage() {
  const entries = getSeoCalendar();
  const upcoming = nextUp(entries, (e) => e.dueDate, [
    "published",
    "skipped",
    "rejected",
  ]);
  return (
    <CalendarBoard
      title="SEO content"
      description="The editorial plan and where every article is in the pipeline."
      nextUp={upcoming.map(toRow)}
      rows={entries.map(toRow)}
    />
  );
}
