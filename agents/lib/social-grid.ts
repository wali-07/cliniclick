/**
 * Build the 3x3 IG-grid layout context for a candidate social post.
 *
 * The Visuals + Image-Brand agents need to know WHERE on the grid the
 * new post lands, what bgColor sits to its right (same row), below
 * (same column) and diagonally down-right - so they can pick (Visuals)
 * or validate (Image-Brand) a colour that doesn't clash with its visible
 * neighbours. Position (0,0) = top-left = NEWEST post.
 *
 * Source of truth: editorial/social-calendar.yaml, posted+delivered
 * entries sorted reverse-chronologically by scheduledFor. Each entry
 * declares its colour via a structured `bgColor` field.
 *
 * Output: pass `asText` verbatim into the agent's user message under a
 * line that starts with "GRID CONTEXT". Both prompts (visuals.md,
 * image-brand.md) document how to use it.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";

const CAL = resolve(process.cwd(), "editorial/social-calendar.yaml");

type Post = {
  topic: string;
  slug: string;
  scheduledFor: string;
  status: string;
  bgColor?: string;
};

/** The curated lively palette (the ONLY valid bgColor values). */
export const PALETTE = [
  "purple",
  "coral",
  "teal",
  "butter-yellow",
  "sky-blue",
  "lavender",
] as const;

export type PaletteColour = (typeof PALETTE)[number];

/** Approximate hue (degrees) for each palette colour - mirrors the doc
 *  in social-recolor.ts. */
export const HUE_FOR: Record<PaletteColour, number> = {
  purple: 268,
  coral: 8,
  teal: 175,
  "butter-yellow": 48,
  "sky-blue": 205,
  lavender: 255,
};

export type Cell = { slug: string; bgColor?: string };

export type GridContext = {
  /** Row-major 3x3, [0][0] = newest = top-left. */
  layout: Cell[][];
  /** Direct neighbours the candidate MUST not clash with. */
  adjacents: { name: string; cell: Cell }[];
  /** Pass verbatim to the Visuals / Image-Brand agent user message. */
  asText: string;
};

/**
 * Compute the grid context that would result IF the given candidate were
 * the next post added. The candidate is conceptually inserted at the
 * top-left; every other posted/delivered entry shifts one position later.
 */
export function buildGridContext(args: {
  candidateSlug: string;
  candidateBgColor?: PaletteColour;
}): GridContext {
  const cal = yaml.load(readFileSync(CAL, "utf-8")) as { posts: Post[] };
  const eligible = cal.posts.filter(
    (p) =>
      (p.status === "posted" || p.status === "delivered") &&
      p.slug !== args.candidateSlug
  );
  // Newest first by scheduledFor (ties broken by calendar order = first wins).
  eligible.sort((a, b) =>
    a.scheduledFor < b.scheduledFor
      ? 1
      : a.scheduledFor > b.scheduledFor
        ? -1
        : 0
  );

  const slots: Cell[] = [
    { slug: args.candidateSlug, bgColor: args.candidateBgColor },
    ...eligible.slice(0, 8).map((p) => ({ slug: p.slug, bgColor: p.bgColor })),
  ];
  while (slots.length < 9) slots.push({ slug: "—" });

  const layout: Cell[][] = [
    slots.slice(0, 3),
    slots.slice(3, 6),
    slots.slice(6, 9),
  ];

  const adjacents = [
    { name: "right neighbour (same row)", cell: layout[0][1] },
    { name: "below neighbour (same column)", cell: layout[1][0] },
    { name: "diagonal down-right neighbour", cell: layout[1][1] },
  ].filter((a) => a.cell.slug !== "—");

  const lines: string[] = [];
  lines.push(
    "GRID CONTEXT (Instagram 3-wide grid AFTER this post lands; (0,0) = newest = top-left):"
  );
  for (let r = 0; r < 3; r++) {
    const row = layout[r]
      .map((c) => {
        if (c.slug === "—") return "—";
        const label =
          c.slug === args.candidateSlug
            ? `[NEW: ${c.bgColor ?? "?"}]`
            : `${c.slug}(${c.bgColor ?? "?"})`;
        return label;
      })
      .join(" | ");
    lines.push(`  ${row}`);
  }
  lines.push("");
  // Pre-compute the three lines through the new post so the agent does
  // NOT have to do its own position arithmetic (it gets this wrong).
  const row0 = layout[0];
  const col0 = [layout[0][0], layout[1][0], layout[2][0]];
  const diag = [layout[0][0], layout[1][1], layout[2][2]];
  const fmtLine = (cells: Cell[]) =>
    cells
      .map((c) =>
        c.slug === args.candidateSlug
          ? `[NEW: ${c.bgColor ?? "?"}]`
          : c.slug === "—"
            ? "—"
            : `${c.slug} (${c.bgColor ?? "?"})`
      )
      .join(", ");
  lines.push("");
  lines.push(
    "The three lines through the NEW post (pre-computed - do NOT recount positions):"
  );
  lines.push(`  Row 0: [${fmtLine(row0)}]`);
  lines.push(`  Column 0: [${fmtLine(col0)}]`);
  lines.push(`  Main diagonal: [${fmtLine(diag)}]`);
  lines.push("");
  lines.push("Grid-harmony rules for the NEW post's bgColor:");
  lines.push(
    "  1. MUST NOT equal any direct neighbour (listed above)."
  );
  lines.push(
    "  2. MUST NOT equal another colour that ALSO appears on one of the three lines through the NEW post (listed above). To check, scan each line above and see if any non-NEW cell has the same colour as [NEW: x]. If not, rule 2 PASSES."
  );
  lines.push(
    "     Colours that appear ONLY at off-line positions (e.g. (1,2), (2,1)) are NOT on a line through the new post and do NOT count as a clash."
  );
  lines.push("  3. The curated palette is: " + PALETTE.join(", ") + ".");
  if (adjacents.length) {
    lines.push("");
    lines.push("Direct neighbours (clash-forbidden):");
    for (const a of adjacents) {
      lines.push(`  - ${a.name}: ${a.cell.slug} (${a.cell.bgColor ?? "?"})`);
    }
  }
  return { layout, adjacents, asText: lines.join("\n") };
}

/**
 * From a candidate's grid context, list the palette colours that violate
 * any direct-neighbour rule. The Visuals Agent's brief should be picked
 * from outside this set; a recolor's --to-hue should not map back into
 * one of these colours.
 */
export function disallowedColours(grid: GridContext): PaletteColour[] {
  const banned = new Set<string>();
  for (const a of grid.adjacents) {
    if (a.cell.bgColor) banned.add(a.cell.bgColor);
  }
  return PALETTE.filter((c) => banned.has(c));
}
