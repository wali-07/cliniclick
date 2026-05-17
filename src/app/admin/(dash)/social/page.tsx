import {
  getSocialCalendar,
  nextUp,
  type SocialPost,
  type SocialStatus,
} from "@/lib/admin/calendars";
import {
  CalendarBoard,
  type BoardRow,
  type Tone,
} from "@/components/admin/calendar-board";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TONE: Record<SocialStatus, Tone> = {
  draft: "grey",
  delivered: "purple",
  posted: "green",
  skipped: "grey",
};
const LABEL: Record<SocialStatus, string> = {
  draft: "Draft",
  delivered: "In Telegram - to post",
  posted: "Posted",
  skipped: "Skipped",
};

function toRow(p: SocialPost): BoardRow {
  return {
    id: `${p.slug}-${p.scheduledFor}`,
    date: p.scheduledFor,
    title: p.topic,
    sub: p.article,
    statusLabel: LABEL[p.status],
    tone: TONE[p.status],
    notes: p.notes,
  };
}

export default function AdminSocialPage() {
  const posts = getSocialCalendar();
  const upcoming = nextUp(posts, (p) => p.scheduledFor, ["posted", "skipped"]);
  return (
    <CalendarBoard
      title="Social (Instagram)"
      description="The Instagram plan and where each post is - draft, in Telegram to post, or live."
      nextUp={upcoming.map(toRow)}
      rows={posts.map(toRow)}
    />
  );
}
