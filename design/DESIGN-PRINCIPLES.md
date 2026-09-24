# Design principles

Documentation only, like everything under `design/`: nothing in `src/` imports it.

## Direction

Editorial, dense, quiet. The reference is a printed sports-section ledger, not an app.
Differentiation comes from:

- **Display serif italic** (Fraunces) for kickers, the site title, and section breaks. These carry real
  weight, not decoration. Utility classes in `src/app.css`: `.kicker`, `.section-head`, `.serif`.
- **Tabular numerals as a typographic feature.** `font-variant-numeric: tabular-nums` is set on `body`,
  so every column of odds, records and scores aligns.
- **Density that trusts the reader.** Hairline rows (`.ledger`), small type, no padding for its own sake.

## Hard avoids

- ESPN / Yahoo / NFL.com fantasy chrome: banner ads, team-color clutter, gamified badges.
- Sleeper's own chunky-pill mobile-app feel, position color codes, team-logo wallpaper.
- Generic SaaS dashboard: tinted card on tinted card, hero-metric template, identical card grids,
  gradient-icon tiles.
- Crypto / sportsbook neon: gradient buttons, glowing borders, animated tickers.

## Soft avoid

An unmodified Linear / Vercel / Stripe-blog clone. If a screen could appear unchanged in a Linear
marketing template, it is wrong.

## How this is implemented

- **Tokens** live in `src/app.css`. Colors are CSS custom properties re-exposed to Tailwind through
  `@theme inline`. Do not introduce new hex values in components.
- **Flat by default.** `@theme` zeroes `--shadow-lg/xl/2xl` and tightens `--radius-md..3xl` to 3-6px,
  so legacy `shadow-xl rounded-3xl` classes still in older pages render flat and square. Prefer
  removing the classes when you touch a page.
- **Fonts** (loaded in `src/app.html`): Fraunces (serif, headings), Inter (body), Archivo
  (`font-display`, uppercase UI labels), Material Icons.
- **Nav** is text links with an underline on the active page. **Buttons** (`src/lib/ui/Button.svelte`)
  are square-cornered: solid dark, or outlined. No glow, no gradient.
- Light mode only. There is no dark theme.
- Framework stays SvelteKit 2 / Svelte 5 / Tailwind 4. A React rewrite was considered and rejected:
  none of this look depends on the framework, and the site is a fork of `nmelhado/league-page`.

## Status by page

| Page | State |
|---|---|
| Home | Rebuilt: masthead, ledgers, Parlay History link beside Head-to-Head |
| Nav / footer / buttons | Restyled |
| Rivalry, Standings, Parlay History | Headings restyled; panels still boxed (shadows now flat) |
| Matchups | Toggle restyled; matchup cards untouched |
| Records, Awards, Managers, Rosters, Drafts, Transactions, Blog | Not yet touched |
