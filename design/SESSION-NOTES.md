# Session notes — not app code

This file is documentation only. It lives under `design/`, which nothing in
`src/` imports or references, so it is never bundled, executed, or loaded by
the site — it's just a record of what's been done, for humans (and future
Claude sessions) to read.

## Rivalry page ("Who Owns Who?")

- `src/lib/Rivalry/index.svelte`: renamed header from "Rivalry" to
  "Who Owns Who?", dropped the "All-time head-to-head results..." subhead.
  Made `headToHead` a bindable prop with a stale-cache refresh in `onMount`
  (matching the pattern already used for `transactionsInfo`/`playersInfo`/
  `recordsInfo`).
- `src/lib/Rivalry/HeatMap.svelte`: removed the boxed white card background
  and the "Head-to-Head Heat Map" `<h3>` so the grid sits directly on the
  page's orange gradient wash. Tightened cell size, gaps, header height, and
  font sizes so it reads like a GitHub-contribution-style heat map while
  still showing win% / point-diff per cell.

## Head-to-head phantom ties bug (fixed)

- Root cause: `src/lib/utils/helperFunctions/headToHead.js` recorded a
  `points: 0` vs `points: 0` matchup (Sleeper's API return for weeks not yet
  played this season) as a 0–0 tie, so nearly every pairing showed a fake
  tie in its record.
- Fix: skip any matchup entry where both sides have zero points before
  calling `recordResult`.
- Also fixed stale-cache propagation: `Rivalry/index.svelte` now refreshes
  `headToHead` from the network if the cached `localStorage` copy is marked
  `stale`, so browsers holding the old buggy cached matrix pick up the fix
  instead of showing it forever.

## Homepage: "Preseason Dress Odds"

- Originally a card above the winners/losers cards. It is now a ledger section
  (see "Editorial restyle" below) with the 10 manager/odds pairs ranked in two
  5-row columns (Enright +450 down to Johnny +1200).

## Parlay History page — full rebuild

Followed `design/PARLAY-REDESIGN-PROMPT.md` and its companion mockup
`design/parlay-redesign-mockup.html` (a static reference build — not part of
the app, never routed to or imported).

- New file `src/lib/ParlayHistory/parlayStats.js`: pure derivation functions
  shared by every view — `betType()` (infers Spread/Moneyline/Total/Prop
  from the free-text pick string), `managerLog`, `streak`, `bestStreak`,
  `recordByType`, `managerStats`, `weekStats`, `seasonRecord`, and
  `flattenWeeks()` (merges every season's weeks into one chronological list,
  tagged with `year` — the input to the all-time view).
- Rewrote `src/lib/ParlayHistory/index.svelte` as a single-page layout:
  week rail → betting-slip ticket view → "how close we got" trend chart →
  manager×week heatmap → leg win-rate chart → expandable manager ledger →
  all-time manager ledger (see below). Loading-skeleton states are wired to
  a manual `loading` toggle in the header (there's no real async boundary on
  this route — data is resolved server-side in `+page.js` before render —
  so the toggle exists purely to preview/QA the skeletons).
- Deleted `CurrentSeasonParlays.svelte` and `AllTimeParlays.svelte` — the old
  tab-switch UI the redesign replaced.
- `+page.js` / `+page.svelte` contracts (`{ parlayHistory, leagueTeamManagers }`)
  were left unchanged.
- Verified against the brief's numbers: ChuckLeady/tigbits711 7–3,
  ryebread00 6–4, CamMacIntosh 2–6, ticket sequence
  7/9 2/6 6/9 6/8 5/10 3/8 2/8 5/10 6/9 4/7, season record 0–10.

### 2026 season + All-Time ledger

- `src/lib/data/parlayHistory.json`: added a 2026 season block. It started
  empty and now has Weeks 1-2 (commit `e93c964` and later data updates).
- Added a new "All-Time manager ledger" section at the bottom of the page,
  built from `flattenWeeks(parlayHistory.seasons)` across every season. It
  shares the same table/drawer markup as the per-season ledger via a Svelte
  `{#snippet ledgerTable(...)}`, parameterized by which stats/season/expand-
  state to use. It now includes 2026 automatically as weeks are added; no code changes
  are needed per week.

## Editorial restyle + Parlay History link (this session)

Decision: stay on SvelteKit/Svelte 5/Tailwind 4 rather than moving to React.
Direction and the hard-avoid list are recorded in `design/DESIGN-PRINCIPLES.md`.

- `src/app.css`: removed the orange wash behind the header; added the
  `--font-serif` token (Fraunces); `@theme` now zeroes `--shadow-lg/xl/2xl`
  and tightens radii, so older pages flatten without edits; `tabular-nums` on
  `body`; new `.serif`, `.kicker`, `.section-head`, `.ledger` classes.
- `src/app.html`: loads Fraunces (roman + italic, opsz axis).
- `src/routes/+page.svelte`: rewritten. Left-aligned masthead with a serif
  italic season kicker and a large serif title; the CTA row is now Matchups,
  Head-to-Head and **Parlay History** (`/parlay-history`). Dress Odds, Winner
  of Dinna and Dress Bitch are ledger sections, not cards; the two
  winner/loser tables share one `{#each}`.
- `src/lib/ui/Button.svelte`: square corners, solid dark / outlined variants,
  no shadow.
- Nav (`Nav/index`, `NavLarge`, `NavSmall`) and `Footer.svelte`: underline
  active state instead of orange pills; serif italic brand; flat dropdown.
- `Rivalry`, `Standings`, `ParlayHistory` headings: `font-serif` (h1) and
  serif italic (h2). `MatchupsAndBrackets` toggle: flat, dark-when-active.
- Not yet restyled: see the status table in `DESIGN-PRINCIPLES.md`.
- Verified: dev server serves `/`, `/parlay-history`, `/rivalry`, `/matchups`
  with 200. `vite build` compiles but the Vercel adapter refuses local Node 24;
  use Node 22 or let Vercel build. Not yet checked visually in a browser.

## Adding parlay data

See `docs/PARLAY-DATA-GUIDE.md`.

## Git history for this work (on `master`)

- `379de71` → `4fda43a`: Rivalry redesign + Preseason Dress Odds (bundled
  push of accumulated changes).
- `4fda43a` → `f25e74b`: head-to-head phantom-ties fix.
- `f25e74b` → `928f63f`: Parlay History full rebuild, 2026 season block,
  All-Time ledger.
- `928f63f` → `e93c964`: parlay data updates.
- Uncommitted at time of writing: the editorial restyle above and `docs/`.

All work in this session was front-end only, scoped to this fork of
nmelhado/league-page.
