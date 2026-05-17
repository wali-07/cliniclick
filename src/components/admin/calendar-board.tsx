/**
 * Read-only agenda/calendar board for the admin dashboard. Shows a
 * "What's next" highlight strip then the full plan grouped by month, each
 * row with a status chip - so Abdullah can see at a glance what's coming and
 * what stage everything is in.
 */

export type Tone = "grey" | "blue" | "amber" | "green" | "red" | "purple";

export type BoardRow = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  sub?: string;
  statusLabel: string;
  tone: Tone;
  notes?: string;
};

const TONE: Record<Tone, string> = {
  grey: "bg-ink-100 text-ink-600",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-800",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
};

function fmt(d: string): string {
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function monthKey(d: string): string {
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime())
    ? "Scheduled"
    : dt.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function Chip({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONE[tone]}`}
    >
      {label}
    </span>
  );
}

function Row({ row }: { row: BoardRow }) {
  return (
    <li className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white px-5 py-4">
      <div className="w-14 shrink-0 text-sm font-semibold text-navy-900">
        {fmt(row.date)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy-900">{row.title}</p>
        {row.sub && <p className="mt-0.5 text-xs text-ink-500">{row.sub}</p>}
        {row.notes && (
          <p className="mt-1 text-xs italic text-ink-400">{row.notes}</p>
        )}
      </div>
      <Chip label={row.statusLabel} tone={row.tone} />
    </li>
  );
}

export function CalendarBoard({
  title,
  description,
  nextUp,
  rows,
}: {
  title: string;
  description: string;
  nextUp: BoardRow[];
  rows: BoardRow[];
}) {
  const groups: { month: string; items: BoardRow[] }[] = [];
  for (const r of rows) {
    const m = monthKey(r.date);
    const g = groups.find((x) => x.month === m);
    if (g) g.items.push(r);
    else groups.push({ month: m, items: [r] });
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-navy-900">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">{description}</p>
      </div>

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700">
          What&apos;s next
        </h2>
        {nextUp.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            Nothing upcoming - all caught up.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {nextUp.map((r) => (
              <Row key={`n-${r.id}`} row={r} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700">
          Full plan
        </h2>
        <div className="mt-3 space-y-8">
          {groups.map((g) => (
            <div key={g.month}>
              <p className="mb-2.5 text-sm font-semibold text-ink-600">
                {g.month}
              </p>
              <ul className="space-y-2.5">
                {g.items.map((r) => (
                  <Row key={r.id} row={r} />
                ))}
              </ul>
            </div>
          ))}
          {groups.length === 0 && (
            <p className="text-sm text-ink-500">No entries yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
