# Parlay History redesign — implementation brief

Rebuild the `/parlay-history` page in this repo. A finished visual mockup of the target
is committed at `design/parlay-redesign-mockup.html` — **open that file in a browser and
read its source before writing any code.** It is a single static HTML file with the real
`parlayHistory.json` data baked in, and it is the spec. Match its layout, copy, colors,
type, and interactions. Where this brief and the mockup disagree, the mockup wins.

## What exists today

- Route: `src/routes/parlay-history/+page.svelte` + `+page.js` (loads `$lib/data/parlayHistory.json`)
- Components: `src/lib/ParlayHistory/index.svelte`, `CurrentSeasonParlays.svelte` (331 lines),
  `AllTimeParlays.svelte` (296 lines)
- Stack: SvelteKit 2, Svelte 5 (runes — the existing components already use `$props()` / `$state()`),
  Tailwind v4, SMUI 8 beta for buttons/tables
- Design tokens: `src/app.css`. **Every color must come from these custom properties.**
  Do not introduce new hex values anywhere.

## Data shape (`src/lib/data/parlayHistory.json`)

```
seasons: [ { year: "2025", weeks: [ {
  week, seasonWeek, date, parlayResult: "loss", payout: 0,
  thrownBy: { managerID, managerName },
  picks: [ { managerID, managerName, pick, result: "win"|"loss" } ]
} ] } ]
```

Facts the current UI gets wrong or ignores:

- Weeks have **6–10 picks**, not a fixed 10. Never assume a constant leg count.
- `payout` is `0` on every row and there is **no odds field**. Do not display a
  "would have paid" figure — it can't be computed. Show `payout` as-is.
- There is **no bet-type field**. Derive it from the pick string with this exact
  precedence, and put the helper in `src/lib/ParlayHistory/parlayStats.js`:
  1. contains `spread` → `Spread`
  2. matches `/\bml\b|moneyline/i` → `Moneyline`
  3. matches `/\bover\b|\bunder\b|\bo\/u\b|\btotal\b/i` → `Total`
  4. matches `/[+-]\d+(\.\d+)?/` → `Spread`
  5. otherwise → `Prop`
  On the current data this yields 51 Prop / 16 Moneyline / 10 Spread / 7 Total.
- `thrownBy` is **not** always one of the pickers — in W11 jenright19 threw the ticket
  without having a leg in it. Don't couple those.
- Season 2024 exists with `weeks: []`. Handle an empty season without crashing.
- `Spent` = **$10 for each week a manager was `thrownBy`**, which is how the current
  code computes it. Keep that. It is a last-place penalty from the fantasy league, not
  a skill signal, so it must never be charted against performance.

## Build these sections, in this order

Put shared derivations in a new `src/lib/ParlayHistory/parlayStats.js` (pure functions,
no Svelte) so both the season and all-time views use one implementation:
`managerStats(season)`, `weekStats(season)`, `streak(season, managerName)`,
`bestStreak(...)`, `recordByType(...)`, `betType(pickString)`.

1. **Header** — h1 "Weekly Parlay History", the league's own line about the format, and a
   season `<select>`. Show the season's parlay record (e.g. `0–10`) in `--danger`.

2. **Week rail** — replaces the Year/Week dropdowns. One button per week in a
   `repeat(10, 1fr)` grid; each shows `W02`, `7/9`, and a meter bar filled to the hit
   rate. A left edge stripe in `--danger`, switching to `--accent` when
   `hit === total`. A `--primary` dot marks the week(s) with the fewest missed legs.
   Selected week gets `--primary-dim` background and a `--primary` border. Clicking
   sets the selected week.

3. **Ticket** — the selected week as a betting slip: mono type, dashed rules, scalloped
   perforation on the top and bottom edges, a rotated `LOST` stamp, one row per leg
   (index / manager / pick / `✓ HIT` or `✕ MISS`), and a footer of Stake / Legs / Payout.
   Beside it: a big `4 / 7` "legs cashed" figure, Thrown by, Hit rate, and the missed
   managers as chips.

4. **"How close we got"** — a column chart, one column per week. A ghost bar in
   `--surface-3` for total legs and a solid `--primary` bar for legs hit; a ticket only
   pays when they meet. Direct-label only the closest week(s). Clicking a column selects
   that week and scrolls to the ticket. Below it, one callout card per closest ticket
   naming who missed.

5. **Manager × week heatmap** — rows are managers sorted by win rate, columns are weeks.
   `--heat-win-strong` for a hit, `--heat-loss-strong` for a miss, `--surface-2` with a
   border for did-not-play. **A `✓` / `✕` / `·` glyph must render inside every cell** —
   that green/red pair is ΔE 5.9 under deuteranopia, so color alone is not readable.
   Row label left, `W–L` plus a current-streak chip on the right, and a footer row of
   each ticket's `hit/total`. Hovering a cell shows the actual pick in a tooltip.
   Cells are keyboard focusable and show the same tooltip on focus.

6. **Leg win rate** — full-width horizontal bars in `--primary`, sorted descending,
   with a hairline reference line at 50%, the percentage at each bar end, and
   `W–L · N wks` right-aligned.

7. **Manager ledger** — table: `#`, Manager, Weeks, W–L, Win %, Streak, Spent.
   Clicking a row (or Enter/Space on it) expands a drawer with that manager's full
   pick log (week / pick / type / result) and their record by bet type. Only one drawer
   open at a time.

8. **Loading states** — a real `{#if loading}` branch per section rendering shimmer
   skeletons shaped like the content they replace, so nothing jumps when data lands.
   Wire it to the load state; the mockup has a toggle button purely for previewing it.

## Delete

- The Current Season / All-Time tab switch — both tabs render identical content while
  only one season has data. Bring it back when 2024 or 2026 has weeks.
- The `Parlay Wins`, `Total Winnings`, and `Cost / Hit` columns, and the
  `Parlay Performance by Season` table. All structurally zero or single-row.

## Constraints

- No new runtime dependencies. Charts are hand-written inline SVG — do not add
  Chart.js, D3, or LayerCake.
- Light mode only. `app.css` sets `color-scheme: light` and the repo has no dark theme;
  don't invent one.
- Keep the `+page.js` load contract and the `{ parlayHistory, leagueTeamManagers }`
  props unchanged. Managers should still link out via `gotoManager` where the current
  code does.
- Every chart keeps a `<details>` "Show the numbers" table underneath it.
- Wide content (the heatmap) scrolls inside its own `overflow-x: auto` container; the
  page body must never scroll sideways.
- Respect `prefers-reduced-motion` for the shimmer and hover transitions.

## Verify before you finish

1. `npm run dev`, open `/parlay-history`, and check every week in the rail renders a
   ticket with the right leg count.
2. Confirm the derived numbers still match the current page: ChuckLeady and tigbits711
   7–3, ryebread00 6–4, CamMacIntosh 2–6 on an L6 streak, tickets 7/9 2/6 6/9 6/8 5/10
   3/8 2/8 5/10 6/9 4/7, season record 0–10.
3. Tab through the heatmap and the ledger rows — focus must be visible and tooltips
   must appear on focus, not just hover.
4. `npm run lint`.
