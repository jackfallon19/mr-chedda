<script>
	import { managerStats, weekStats, seasonRecord, managerLog, recordByType, betType, flattenWeeks } from './parlayStats.js';
	import { gotoManager } from '$lib/utils/helper';

	let { parlayHistory, leagueTeamManagers } = $props();

	let selectedYear = $state(parlayHistory.seasons.find((s) => s.weeks?.length)?.year ?? parlayHistory.seasons[0]?.year);
	let season = $derived(parlayHistory.seasons.find((s) => s.year === selectedYear) ?? parlayHistory.seasons[0]);
	let weeks = $derived(weekStats(season));
	let stats = $derived(managerStats(season));
	let record = $derived(seasonRecord(season));

	// combines every season played so far into one ledger - currently just 2025, and it
	// folds 2026 in automatically as those weeks pick up data
	let allTimeSeason = $derived({ year: 'All-Time', weeks: flattenWeeks(parlayHistory.seasons) });
	let allTimeStats = $derived(managerStats(allTimeSeason));
	let allTimeRecord = $derived(seasonRecord(allTimeSeason));
	let allTimeExpandedManagerID = $state(null);

	let selectedWeek = $state(null);
	$effect(() => {
		if (weeks.length && !weeks.some((w) => w.week === selectedWeek)) {
			selectedWeek = weeks[weeks.length - 1].week;
		} else if (!weeks.length) {
			selectedWeek = null;
		}
	});
	let selectedWeekData = $derived(weeks.find((w) => w.week === selectedWeek) ?? null);

	let expandedManagerID = $state(null);
	$effect(() => {
		selectedYear;
		expandedManagerID = null;
	});

	// this page never fetches on its own - +page.js resolves everything before render -
	// this toggle exists purely so the skeleton states can be previewed/QAed
	let loading = $state(false);

	let ticketSection = $state();
	const selectWeek = (week) => {
		selectedWeek = week;
		ticketSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const minMiss = $derived(weeks.length ? Math.min(...weeks.map((w) => w.total - w.hit)) : 0);
	const isNear = (w) => weeks.length > 0 && w.total - w.hit === minMiss;
	const closest = $derived(
		weeks.filter(isNear).sort((a, b) => b.hit / b.total - a.hit / a.total).slice(0, 2)
	);

	const trendGeo = $derived.by(() => {
		if (!weeks.length) return null;
		const x0 = 52,
			x1 = 1058,
			yTop = 26,
			yBot = 248;
		const maxY = Math.max(...weeks.map((w) => w.total));
		const band = (x1 - x0) / weeks.length;
		const bw = Math.min(52, band - 18);
		const y = (v) => yBot - (v / maxY) * (yBot - yTop);
		const gridlines = [];
		for (let g = 0; g <= maxY; g += 2) gridlines.push({ v: g, y: y(g) });
		const bars = weeks.map((w, i) => {
			const cx = x0 + band * i + band / 2;
			const bx = cx - bw / 2;
			return { w, cx, bx, bw, yTotal: y(w.total), hTotal: yBot - y(w.total), yHit: y(w.hit), hHit: yBot - y(w.hit), near: isNear(w) };
		});
		return { x0, x1, yTop, yBot, maxY, bars, gridlines };
	});

	const winGeo = $derived.by(() => {
		if (!stats.length) return null;
		const x0 = 124,
			x1 = 880,
			yTop = 16,
			rowH = 32,
			bh = 15;
		const x = (p) => x0 + p * (x1 - x0);
		const rows = stats.map((s, i) => ({ s, y: yTop + i * rowH, barW: Math.max(3, x(s.winPct) - x0) }));
		const height = yTop + stats.length * rowH + 24;
		return { x0, x1, yTop, rowH, bh, x, rows, height };
	});

	const W = (n) => 'W' + String(n).padStart(2, '0');

	/* ---------- tooltip ---------- */
	let tip = $state(null); // { x, y, title, rows }
	const showTip = (e, data) => (tip = { ...data, x: e.clientX, y: e.clientY });
	const showTipAt = (el, data) => {
		const r = el.getBoundingClientRect();
		tip = { ...data, x: r.left + r.width / 2, y: r.bottom - 6 };
	};
	const hideTip = () => (tip = null);

	const weekTip = (w) => ({
		title: W(w.week),
		rows: [{ text: w.date }, { text: `${w.hit} of ${w.total} legs hit` }, { text: `Thrown by ${w.thrownBy?.managerName ?? '—'}` }],
	});
	const weekTrendTip = (w) => ({
		title: `${W(w.week)} · ${w.date}`,
		rows: [
			{ text: `${w.hit} hit`, cls: 'text-accent' },
			{ text: `${w.total - w.hit} missed`, cls: 'text-danger' },
			{ text: `Thrown by ${w.thrownBy?.managerName ?? '—'}` },
		],
	});
	const heatCellTip = (s, w, pick) => ({
		title: `${s.managerName} · ${W(w.week)}`,
		rows: [
			{ text: pick.pick },
			{ text: pick.result === 'win' ? '✓ Hit' : '✕ Missed', cls: pick.result === 'win' ? 'text-accent' : 'text-danger' },
			{ text: betType(pick.pick) },
		],
	});
	const winBarTip = (s) => ({
		title: s.managerName,
		rows: [{ text: `${s.wins}–${s.losses} in ${s.weeks} weeks` }, { text: `${Math.round(s.winPct * 100)}% of legs cashed` }],
	});
</script>

<div class="max-w-[1400px] mx-auto px-4 sm:px-8 py-10 sm:py-14">
	<!-- header -->
	<div class="flex flex-wrap items-end justify-between gap-6">
		<div>
			<p class="mono text-[11px] tracking-[0.16em] uppercase text-text-muted mb-3">Mr. Chedda &middot; Weekly Parlay</p>
			<h1 class="font-display font-black uppercase tracking-tight text-4xl sm:text-5xl">Weekly Parlay History</h1>
			<p class="text-text-muted max-w-[48ch] mt-3">
				One ticket a week. Whoever finished last in points the week before puts up the $10. Every leg has to hit.
			</p>
		</div>
		<div class="flex flex-col items-end gap-3">
			<div class="flex items-baseline gap-2 font-display">
				<span class="text-4xl font-extrabold tracking-tight text-danger">{record.wins}&ndash;{record.losses}</span>
				<span class="mono text-[11px] tracking-[0.14em] uppercase text-text-muted">{selectedYear} season</span>
			</div>
			<div class="flex gap-2 items-center">
				<select
					class="h-[34px] px-3 rounded-md border border-border bg-surface text-sm font-medium"
					aria-label="Season"
					bind:value={selectedYear}
				>
					{#each parlayHistory.seasons as s}
						<option value={s.year}>{s.year} season{!s.weeks?.length ? ' — no tickets yet' : ''}</option>
					{/each}
				</select>
				<button
					class="h-[34px] px-3 rounded-md border border-border bg-surface text-xs font-medium hover:border-primary transition-colors"
					aria-pressed={loading}
					onclick={() => (loading = !loading)}
				>
					{loading ? 'Show loaded state' : 'Preview loading state'}
				</button>
			</div>
		</div>
	</div>

	<div class="perf"></div>

	<!-- 1. week rail -->
	<section>
		<div class="flex items-baseline justify-between gap-4 flex-wrap mb-1">
			<h2 class="font-display text-xl font-bold">The season so far</h2>
			<span class="mono text-xs text-text-faint">Legs hit / legs on the ticket</span>
		</div>
		<p class="text-text-muted text-sm max-w-[74ch] mb-5">
			The bar is how much of each ticket cashed &mdash; the dots mark the week(s) that came closest.
		</p>

		{#if loading}
			<div class="grid grid-cols-5 sm:grid-cols-10 gap-2">
				{#each Array(10) as _}<div class="sk h-[74px]"></div>{/each}
			</div>
		{:else if !weeks.length}
			<p class="text-text-muted text-sm">No tickets yet this season.</p>
		{:else}
			<div class="grid grid-cols-5 sm:grid-cols-10 gap-2">
				{#each weeks as w}
					<button
						class="relative text-left rounded-lg border overflow-hidden px-3 pt-3 pb-3.5 transition-colors {selectedWeek === w.week
							? 'border-primary bg-primary-dim'
							: 'border-border bg-surface hover:border-text-faint'}"
						aria-pressed={selectedWeek === w.week}
						onclick={() => selectWeek(w.week)}
						onmousemove={(e) => showTip(e, weekTip(w))}
						onmouseleave={hideTip}
						onfocus={(e) => showTipAt(e.currentTarget, weekTip(w))}
						onblur={hideTip}
					>
						<span
							class="absolute inset-y-0 left-0 w-[3px]"
							style="background-color: {w.hit === w.total ? 'var(--accent)' : 'var(--danger)'};"
						></span>
						{#if isNear(w)}<span class="absolute top-[9px] right-[9px] w-1.5 h-1.5 rounded-full bg-primary"></span>{/if}
						<span class="block mono text-[11px] tracking-wide text-text-muted">{W(w.week)}</span>
						<span class="block font-display font-bold text-lg mt-0.5 mb-2">{w.hit}<small class="text-xs font-semibold text-text-faint"> /{w.total}</small></span>
						<span class="meter"><i style="width: {w.total ? (w.hit / w.total) * 100 : 0}%"></i></span>
					</button>
				{/each}
			</div>
		{/if}
	</section>

	<div class="perf"></div>

	<!-- 2. ticket -->
	<section bind:this={ticketSection}>
		<div class="flex items-baseline justify-between gap-4 flex-wrap mb-1">
			<h2 class="font-display text-xl font-bold">{selectedWeekData ? `Week ${selectedWeekData.week}` : 'This week\'s ticket'}</h2>
			{#if selectedWeekData}
				<span class="mono text-xs text-text-faint">{selectedWeekData.date} &middot; thrown by {selectedWeekData.thrownBy?.managerName ?? '—'}</span>
			{/if}
		</div>
		<p class="text-text-muted text-sm mb-5">Pick a week above to change the ticket.</p>

		{#if loading}
			<div class="grid md:grid-cols-[1.4fr_1fr] gap-5">
				<div class="sk h-[420px] rounded"></div>
				<div class="sk h-[300px] rounded-xl"></div>
			</div>
		{:else if selectedWeekData}
			{@const w = selectedWeekData}
			{@const misses = w.picks.filter((p) => p.result === 'loss')}
			<div class="grid md:grid-cols-[1.4fr_1fr] gap-5 items-start">
				<div class="ticket rounded border border-border shadow-xl shadow-black/20 bg-surface mono text-[13px]">
					{#if w.result !== 'win'}
						<div class="stamp absolute right-[18px] top-[54px] border-2 border-danger text-danger rounded px-2.5 py-0.5 text-[13px] font-semibold tracking-[.2em] opacity-85 bg-surface">
							LOST
						</div>
					{/if}
					<div class="px-5 pt-[22px] pb-3.5 border-b border-dashed border-border text-center">
						<b class="block text-xs tracking-[.22em] uppercase font-semibold">Mr. Chedda &middot; Season {selectedYear}</b>
						<span class="block text-[11px] text-text-muted tracking-[.08em] mt-1.5">{W(w.week)} &mdash; {w.total}-leg parlay &mdash; {w.date}</span>
					</div>
					{#each w.picks as pick, i}
						<div
							class="grid items-baseline gap-3 px-5 py-2.5 border-b border-surface-2 {i % 2 === 0 ? 'bg-surface-2' : ''}"
							style="grid-template-columns: 22px minmax(88px,auto) 1fr auto;"
						>
							<span class="text-text-faint text-[11px]">{String(i + 1).padStart(2, '0')}</span>
							<button
								class="font-semibold text-xs text-left hover:text-primary transition-colors"
								onclick={() => gotoManager({ leagueTeamManagers, managerID: pick.managerID })}
							>
								{pick.managerName}
							</button>
							<span class="text-text-muted text-[12.5px]" style="overflow-wrap: anywhere;">{pick.pick}</span>
							<span class="text-[11px] font-semibold tracking-[.06em] whitespace-nowrap {pick.result === 'win' ? 'text-accent' : 'text-danger'}">
								{pick.result === 'win' ? '✓ HIT' : '✕ MISS'}
							</span>
						</div>
					{/each}
					<dl class="grid grid-cols-3 gap-3.5 px-5 pt-4 pb-[22px] border-t border-dashed border-border text-[11px] m-0">
						<div><dt class="text-text-faint tracking-[.1em] uppercase text-[10px] mb-1">Stake</dt><dd class="m-0 text-sm font-semibold">${w.stake}</dd></div>
						<div><dt class="text-text-faint tracking-[.1em] uppercase text-[10px] mb-1">Legs</dt><dd class="m-0 text-sm font-semibold">{w.total}</dd></div>
						<div><dt class="text-text-faint tracking-[.1em] uppercase text-[10px] mb-1">Payout</dt><dd class="m-0 text-sm font-semibold">${w.payout}</dd></div>
					</dl>
				</div>
				<div class="flex flex-col gap-3.5">
					<div class="rounded-xl border border-border bg-surface shadow-xl shadow-black/20 px-[22px] py-5">
						<div class="mono text-[10.5px] tracking-[.14em] uppercase text-text-faint">Legs cashed</div>
						<div class="font-display font-extrabold text-5xl tracking-tight mt-2 mb-1">
							{w.hit}<em class="not-italic text-2xl text-text-faint font-semibold"> / {w.total}</em>
						</div>
						<p class="text-text-muted text-[13.5px] m-0 mt-2">
							{#if misses.length === 1}
								One leg away. <b class="text-text">{misses[0].managerName}</b> is buying next week.
							{:else}
								{misses.length} legs missed{w.total - w.hit === minMiss ? ' — as close as this group has come all season.' : '.'}
							{/if}
						</p>
					</div>
					<div class="grid grid-cols-2 gap-2.5">
						<div class="border border-border rounded-lg bg-surface px-4 py-3">
							<div class="mono text-[10px] tracking-[.12em] uppercase text-text-faint">Thrown by</div>
							<div class="mono font-semibold text-[15px] mt-1">{w.thrownBy?.managerName ?? '—'}</div>
						</div>
						<div class="border border-border rounded-lg bg-surface px-4 py-3">
							<div class="mono text-[10px] tracking-[.12em] uppercase text-text-faint">Hit rate</div>
							<div class="mono font-semibold text-[15px] mt-1">{Math.round(w.hitRate * 100)}%</div>
						</div>
					</div>
					<div>
						<div class="mono text-[10px] tracking-[.14em] uppercase text-text-faint mb-2">Missed legs</div>
						<div class="flex flex-wrap gap-1.5">
							{#each misses as m}
								<span class="mono text-[11px] px-2 py-1 rounded bg-danger/10 text-danger">{m.managerName}</span>
							{:else}
								<span class="mono text-[11px] px-2 py-1 rounded bg-accent/10 text-accent">none</span>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{:else}
			<p class="text-text-muted text-sm">No tickets yet this season.</p>
		{/if}
	</section>

	<div class="perf"></div>

	<!-- 3. trend chart -->
	<section>
		<h2 class="font-display text-xl font-bold mb-1">How close we got</h2>
		<p class="text-text-muted text-sm max-w-[74ch] mb-5">
			Ghost bars are the legs on each ticket; solid bars are the ones that hit. A ticket only pays when the solid bar reaches the top of the ghost.
		</p>
		{#if loading}
			<div class="sk h-[300px] rounded-2xl"></div>
		{:else if trendGeo}
			<div class="rounded-2xl border border-border bg-surface shadow-xl shadow-black/20 p-[22px]">
				<div class="flex flex-wrap gap-4 text-xs text-text-muted mb-3.5">
					<span class="inline-flex items-center gap-1.5"><i class="inline-block w-2.5 h-2.5 rounded-sm bg-primary"></i>Legs hit</span>
					<span class="inline-flex items-center gap-1.5"><i class="inline-block w-2.5 h-2.5 rounded-sm bg-surface-3"></i>Legs on the ticket</span>
					<span class="text-text-faint">Labelled weeks came closest</span>
				</div>
				<svg viewBox="0 0 1080 310" role="img" aria-label="Legs hit per week" class="w-full h-auto block">
					{#each trendGeo.gridlines as g}
						<line x1={trendGeo.x0} x2={trendGeo.x1} y1={g.y} y2={g.y} stroke="var(--surface-3)" stroke-width="1" />
						<text x={trendGeo.x0 - 12} y={g.y + 4} text-anchor="end" font-size="11" fill="var(--text-faint)" class="mono">{g.v}</text>
					{/each}
					{#each trendGeo.bars as b}
						<rect x={b.bx} y={b.yTotal} width={b.bw} height={b.hTotal} rx="4" fill="var(--surface-3)" />
						<rect
							x={b.bx}
							y={b.yHit}
							width={b.bw}
							height={b.hHit}
							rx="4"
							fill="var(--primary)"
							tabindex="0"
							role="button"
							style="cursor:pointer;"
							onclick={() => selectWeek(b.w.week)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									selectWeek(b.w.week);
								}
							}}
							onmousemove={(e) => showTip(e, weekTrendTip(b.w))}
							onmouseleave={hideTip}
							onfocus={(e) => showTipAt(e.currentTarget, weekTrendTip(b.w))}
							onblur={hideTip}
						/>
						<text x={b.cx} y={trendGeo.yBot + 22} text-anchor="middle" font-size="11" fill="var(--text-faint)" class="mono">{W(b.w.week)}</text>
						{#if b.near}
							<text x={b.cx} y={b.yHit - 9} text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)" class="mono">{b.w.hit}/{b.w.total}</text>
						{/if}
					{/each}
					<line x1={trendGeo.x0} x2={trendGeo.x1} y1={trendGeo.yBot} y2={trendGeo.yBot} stroke="var(--border-c)" stroke-width="1" />
				</svg>
				<p class="text-text-faint text-xs mt-3">
					{#if closest.length}Best so far: {closest[0].hit} of {closest[0].total} in {W(closest[0].week)}.{/if}
				</p>
				<details class="mt-3.5 pt-2.5 border-t border-surface-3">
					<summary class="text-xs text-text-muted cursor-pointer">Show the numbers</summary>
					<div class="overflow-x-auto mt-2">
						<table class="w-full mono text-xs" style="font-variant-numeric: tabular-nums;">
							<thead>
								<tr class="text-text-faint">
									<th class="text-left font-medium pb-2">Week</th>
									<th class="text-right font-medium pb-2">Date</th>
									<th class="text-right font-medium pb-2">Hit</th>
									<th class="text-right font-medium pb-2">Legs</th>
									<th class="text-right font-medium pb-2">Hit rate</th>
									<th class="text-right font-medium pb-2">Thrown by</th>
									<th class="text-right font-medium pb-2">Payout</th>
								</tr>
							</thead>
							<tbody>
								{#each weeks as w}
									<tr class="border-t border-surface-2">
										<td class="py-1.5">{W(w.week)}</td>
										<td class="text-right py-1.5">{w.date}</td>
										<td class="text-right py-1.5">{w.hit}</td>
										<td class="text-right py-1.5">{w.total}</td>
										<td class="text-right py-1.5">{Math.round(w.hitRate * 100)}%</td>
										<td class="text-right py-1.5">{w.thrownBy?.managerName ?? '—'}</td>
										<td class="text-right py-1.5">${w.payout}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</details>
			</div>
			{#if closest.length}
				<div class="grid sm:grid-cols-2 gap-3.5 mt-5">
					{#each closest as w}
						{@const miss = w.picks.filter((p) => p.result === 'loss').map((p) => p.managerName)}
						<div class="rounded-xl border border-primary bg-primary-dim px-[18px] py-4">
							<div class="mono text-[10px] tracking-[.14em] uppercase text-primary-hover">{W(w.week)} &middot; closest ticket &middot; {w.date}</div>
							<div class="font-display font-bold text-lg mt-1.5 mb-0.5">{w.hit} of {w.total} cashed</div>
							<p class="text-text-muted text-[13px] m-0">Killed by {miss.join(', ')}.</p>
						</div>
					{/each}
				</div>
			{/if}
		{:else}
			<p class="text-text-muted text-sm">No tickets yet this season.</p>
		{/if}
	</section>

	<div class="perf"></div>

	<!-- 4. heatmap -->
	<section>
		<div class="flex items-start justify-between gap-4 flex-wrap mb-1">
			<h2 class="font-display text-xl font-bold">Every leg, every week</h2>
			<div class="flex gap-4 flex-wrap text-xs text-text-muted">
				<span class="inline-flex items-center gap-1.5"><i class="inline-block w-2.5 h-2.5 rounded-sm" style="background-color: var(--heat-win-strong);"></i>Hit</span>
				<span class="inline-flex items-center gap-1.5"><i class="inline-block w-2.5 h-2.5 rounded-sm" style="background-color: var(--heat-loss-strong);"></i>Missed</span>
				<span class="inline-flex items-center gap-1.5"><i class="inline-block w-2.5 h-2.5 rounded-sm bg-surface-2 border border-border"></i>Did not play</span>
			</div>
		</div>
		<p class="text-text-muted text-sm mb-5">Rows sorted by win rate. Hover or focus any square for the actual pick.</p>
		{#if loading}
			<div class="sk h-[400px] rounded-2xl"></div>
		{:else if stats.length}
			<div class="rounded-2xl border border-border bg-surface shadow-xl shadow-black/20 p-[22px] overflow-x-auto">
				<div style="min-width: 800px;">
					<div class="grid gap-[5px] items-center mb-2" style="grid-template-columns: 136px repeat({weeks.length}, minmax(32px,1fr)) 98px;">
						<span></span>
						{#each weeks as w}<span class="mono text-[10px] text-text-faint text-center">{W(w.week)}</span>{/each}
						<span class="mono text-[10px] text-text-faint text-right">Record</span>
					</div>
					{#each stats as s}
						<div class="grid gap-[5px] items-center mt-[5px]" style="grid-template-columns: 136px repeat({weeks.length}, minmax(32px,1fr)) 98px;">
							<button
								class="mono text-[12.5px] font-medium truncate text-left hover:text-primary transition-colors"
								onclick={() => gotoManager({ leagueTeamManagers, managerID: s.managerID })}
							>
								{s.managerName}
							</button>
							{#each weeks as w}
								{@const pick = w.picks.find((p) => p.managerID === s.managerID)}
								{#if !pick}
									<div class="h-8 rounded flex items-center justify-center text-[11.5px] bg-surface-2 border border-border text-text-faint">&middot;</div>
								{:else}
									<button
										class="h-8 rounded flex items-center justify-center text-[11.5px] font-semibold text-white transition-transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
										style="background-color: var({pick.result === 'win' ? '--heat-win-strong' : '--heat-loss-strong'});"
										onmousemove={(e) => showTip(e, heatCellTip(s, w, pick))}
										onmouseleave={hideTip}
										onfocus={(e) => showTipAt(e.currentTarget, heatCellTip(s, w, pick))}
										onblur={hideTip}
									>
										{pick.result === 'win' ? '✓' : '✕'}
									</button>
								{/if}
							{/each}
							<span class="mono text-[11.5px] text-text-muted text-right flex gap-1.5 justify-end items-center">
								{s.wins}&ndash;{s.losses}
								{#if s.streak}
									<b class="text-[10px] px-1.5 py-0.5 rounded font-semibold {s.streak.result === 'win' ? 'bg-accent/15 text-accent' : 'bg-danger/15 text-danger'}">
										{s.streak.result === 'win' ? 'W' : 'L'}{s.streak.count}
									</b>
								{/if}
							</span>
						</div>
					{/each}
					<div class="grid gap-[5px] items-center mt-2.5 pt-2.5 border-t border-surface-3" style="grid-template-columns: 136px repeat({weeks.length}, minmax(32px,1fr)) 98px;">
						<span class="mono text-[10px] text-text-faint tracking-[.1em] uppercase">Ticket</span>
						{#each weeks as w}<span class="mono text-[11px] font-semibold text-text-muted text-center">{w.hit}/{w.total}</span>{/each}
						<span class="mono text-[11.5px] text-text-faint text-right">{record.wins}&ndash;{record.losses}</span>
					</div>
				</div>
			</div>
		{:else}
			<p class="text-text-muted text-sm">No tickets yet this season.</p>
		{/if}
	</section>

	<div class="perf"></div>

	<!-- 5. leg win rate -->
	<section>
		<div class="flex items-baseline justify-between gap-4 flex-wrap mb-1">
			<h2 class="font-display text-xl font-bold">Who is actually carrying</h2>
			<span class="mono text-xs text-text-faint">Share of a manager's own legs that cashed</span>
		</div>
		<p class="text-text-muted text-sm max-w-[74ch] mb-5">Sorted by leg win rate, with the field's midpoint marked at 50%.</p>
		{#if loading}
			<div class="sk h-[330px] rounded-2xl"></div>
		{:else if winGeo}
			<div class="rounded-2xl border border-border bg-surface shadow-xl shadow-black/20 p-[22px]">
				<svg viewBox="0 0 1080 {winGeo.height}" role="img" aria-label="Leg win rate by manager" class="w-full h-auto block">
					<line x1={winGeo.x(0.5)} x2={winGeo.x(0.5)} y1={winGeo.yTop - 6} y2={winGeo.yTop + stats.length * winGeo.rowH - 10} stroke="var(--border-c)" stroke-width="1" />
					<text x={winGeo.x(0.5)} y={winGeo.yTop + stats.length * winGeo.rowH + 6} text-anchor="middle" font-size="10" fill="var(--text-faint)" class="mono">50%</text>
					{#each winGeo.rows as row}
						<text x={winGeo.x0 - 12} y={row.y + winGeo.bh - 2} text-anchor="end" font-size="12" fill="var(--text-muted)" class="mono">{row.s.managerName}</text>
						<rect x={winGeo.x0} y={row.y} width={winGeo.x1 - winGeo.x0} height={winGeo.bh} rx="3" fill="var(--surface-3)" />
						<rect
							x={winGeo.x0}
							y={row.y}
							width={row.barW}
							height={winGeo.bh}
							rx="3"
							fill="var(--primary)"
							tabindex="0"
							role="button"
							aria-label={`${row.s.managerName}: ${Math.round(row.s.winPct * 100)}%`}
							onmousemove={(e) => showTip(e, winBarTip(row.s))}
							onmouseleave={hideTip}
							onfocus={(e) => showTipAt(e.currentTarget, winBarTip(row.s))}
							onblur={hideTip}
						/>
						<text x={winGeo.x0 + row.barW + 9} y={row.y + winGeo.bh - 2} font-size="11.5" fill="var(--text-muted)" class="mono">{Math.round(row.s.winPct * 100)}%</text>
						<text x="1072" y={row.y + winGeo.bh - 2} text-anchor="end" font-size="11.5" fill="var(--text-faint)" class="mono">{row.s.wins}&ndash;{row.s.losses} &middot; {row.s.weeks} wks</text>
					{/each}
				</svg>
				<details class="mt-3.5 pt-2.5 border-t border-surface-3">
					<summary class="text-xs text-text-muted cursor-pointer">Show the numbers</summary>
					<div class="overflow-x-auto mt-2">
						<table class="w-full mono text-xs">
							<thead>
								<tr class="text-text-faint">
									<th class="text-left font-medium pb-2">Manager</th>
									<th class="text-right font-medium pb-2">Weeks</th>
									<th class="text-right font-medium pb-2">W&ndash;L</th>
									<th class="text-right font-medium pb-2">Win %</th>
									<th class="text-right font-medium pb-2">Spent</th>
								</tr>
							</thead>
							<tbody>
								{#each stats as s}
									<tr class="border-t border-surface-2">
										<td class="py-1.5">{s.managerName}</td>
										<td class="text-right py-1.5">{s.weeks}</td>
										<td class="text-right py-1.5">{s.wins}&ndash;{s.losses}</td>
										<td class="text-right py-1.5">{Math.round(s.winPct * 100)}%</td>
										<td class="text-right py-1.5">${s.spent}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</details>
			</div>
		{:else}
			<p class="text-text-muted text-sm">No tickets yet this season.</p>
		{/if}
	</section>

	<div class="perf"></div>

	<!-- 6. manager ledger -->
	<section>
		<div class="flex items-baseline justify-between gap-4 flex-wrap mb-1">
			<h2 class="font-display text-xl font-bold">Manager ledger</h2>
			<span class="mono text-xs text-text-faint">Click a row for the full pick log</span>
		</div>
		<p class="text-text-muted text-sm mb-5">Streak is the current run. Spent is $10 for every week you were the one throwing it.</p>
		{#if loading}
			<div class="flex flex-col gap-2.5">
				{#each Array(9) as _}<div class="sk h-[34px] rounded"></div>{/each}
			</div>
		{:else}
			{@render ledgerTable(stats, season, expandedManagerID, (id) => (expandedManagerID = id), false)}
		{/if}
	</section>

	<div class="perf"></div>

	<!-- 7. all-time manager ledger -->
	<section>
		<div class="flex items-baseline justify-between gap-4 flex-wrap mb-1">
			<h2 class="font-display text-xl font-bold">All-Time manager ledger</h2>
			<span class="mono text-xs text-text-faint">{allTimeRecord.wins}&ndash;{allTimeRecord.losses} tickets across every season</span>
		</div>
		<p class="text-text-muted text-sm mb-5">
			Every leg any manager has thrown, combined across seasons. Currently just 2025 &mdash; 2026 folds in automatically once its tickets start landing.
		</p>
		{#if loading}
			<div class="flex flex-col gap-2.5">
				{#each Array(9) as _}<div class="sk h-[34px] rounded"></div>{/each}
			</div>
		{:else}
			{@render ledgerTable(allTimeStats, allTimeSeason, allTimeExpandedManagerID, (id) => (allTimeExpandedManagerID = id), true)}
		{/if}
	</section>
</div>

{#snippet ledgerTable(list, seasonObj, expandedID, setExpanded, showYear)}
	{#if list.length}
		<div class="rounded-2xl border border-border bg-surface shadow-xl shadow-black/20 p-[22px] overflow-x-auto">
			<table class="w-full text-sm border-collapse">
				<thead>
					<tr class="text-text-faint text-[10.5px] tracking-[.1em] uppercase">
						<th class="text-left font-medium pb-2 w-6"></th>
						<th class="text-left font-medium pb-2">Manager</th>
						<th class="text-right font-medium pb-2">Weeks</th>
						<th class="text-right font-medium pb-2">W&ndash;L</th>
						<th class="text-right font-medium pb-2">Win %</th>
						<th class="text-right font-medium pb-2">Streak</th>
						<th class="text-right font-medium pb-2">Spent</th>
						<th class="w-5"></th>
					</tr>
				</thead>
				<tbody>
					{#each list as s, i}
						{@const expanded = expandedID === s.managerID}
						<tr
							class="cursor-pointer border-t border-border {expanded ? 'bg-primary-dim' : 'hover:bg-surface-2'}"
							role="button"
							tabindex="0"
							aria-expanded={expanded}
							onclick={() => setExpanded(expanded ? null : s.managerID)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									setExpanded(expanded ? null : s.managerID);
								}
							}}
						>
							<td class="py-2.5 text-text-faint">{i + 1}</td>
							<td class="py-2.5 font-semibold">
								<button
									class="hover:text-primary transition-colors"
									onclick={(e) => {
										e.stopPropagation();
										gotoManager({ leagueTeamManagers, managerID: s.managerID });
									}}
								>
									{s.managerName}
								</button>
							</td>
							<td class="py-2.5 text-right">{s.weeks}</td>
							<td class="py-2.5 text-right">{s.wins}&ndash;{s.losses}</td>
							<td class="py-2.5 text-right">{Math.round(s.winPct * 100)}%</td>
							<td class="py-2.5 text-right">
								{#if s.streak}
									<span class="text-[10px] px-1.5 py-0.5 rounded font-semibold {s.streak.result === 'win' ? 'bg-accent/15 text-accent' : 'bg-danger/15 text-danger'}">
										{s.streak.result === 'win' ? 'W' : 'L'}{s.streak.count}
									</span>
								{/if}
							</td>
							<td class="py-2.5 text-right">${s.spent}</td>
							<td class="py-2.5 text-text-faint transition-transform {expanded ? 'rotate-90 text-primary-hover' : ''}">&#9656;</td>
						</tr>
						{#if expanded}
							{@const log = managerLog(seasonObj, s.managerID)}
							{@const bt = recordByType(seasonObj, s.managerID)}
							{@const maxN = Math.max(...bt.map(([, v]) => v.total))}
							<tr class="border-t border-border">
								<td colspan="8" class="p-0">
									<div class="grid md:grid-cols-[1.6fr_1fr] gap-7 py-5">
										<div>
											<p class="mono text-[10px] tracking-[.14em] uppercase text-text-faint mb-3">Pick log &middot; {log.length} legs</p>
											<div class="mono text-xs">
												{#each log as entry}
													<div class="grid gap-2.5 py-1.5 border-b border-surface-2" style="grid-template-columns: {showYear ? '58px' : '38px'} 1fr 84px 50px;">
														<span class="text-text-faint">{showYear && entry.year ? `${entry.year} ` : ''}{W(entry.week)}</span>
														<span>{entry.pick.pick}</span>
														<span class="text-text-faint text-[10.5px] uppercase tracking-[.06em]">{entry.type}</span>
														<span class="font-semibold {entry.pick.result === 'win' ? 'text-accent' : 'text-danger'}">{entry.pick.result === 'win' ? '✓ hit' : '✕ miss'}</span>
													</div>
												{/each}
											</div>
										</div>
										<div>
											<p class="mono text-[10px] tracking-[.14em] uppercase text-text-faint mb-3">Record by bet type</p>
											{#each bt as [type, v]}
												<div class="grid gap-2.5 items-center mb-2 mono text-[11.5px]" style="grid-template-columns: 82px 1fr 54px;">
													<span>{type}</span>
													<span class="h-2.5 rounded bg-surface-3 overflow-hidden"><i class="block h-full rounded bg-primary" style="width: {maxN ? (v.wins / maxN) * 100 : 0}%"></i></span>
													<span>{v.wins}/{v.total}</span>
												</div>
											{/each}
											<p class="text-text-faint text-xs mt-2.5">Bar length is legs hit, out of {maxN} &mdash; their most-used type.</p>
											<p class="mono text-[10px] tracking-[.14em] uppercase text-text-faint mt-6 mb-3">{showYear ? 'All-time notes' : 'Season notes'}</p>
											<div class="grid grid-cols-2 gap-2.5">
												<div class="border border-border rounded-lg bg-surface px-3.5 py-3">
													<div class="mono text-[10px] tracking-[.12em] uppercase text-text-faint">Best run</div>
													<div class="mono font-semibold text-sm mt-1">{s.bestStreak} straight</div>
												</div>
												<div class="border border-border rounded-lg bg-surface px-3.5 py-3">
													<div class="mono text-[10px] tracking-[.12em] uppercase text-text-faint">Legs cashed</div>
													<div class="mono font-semibold text-sm mt-1">{s.wins} of {s.weeks}</div>
												</div>
												<div class="border border-border rounded-lg bg-surface px-3.5 py-3">
													<div class="mono text-[10px] tracking-[.12em] uppercase text-text-faint">Tickets thrown</div>
													<div class="mono font-semibold text-sm mt-1">{s.spent / 10}</div>
												</div>
												<div class="border border-border rounded-lg bg-surface px-3.5 py-3">
													<div class="mono text-[10px] tracking-[.12em] uppercase text-text-faint">Current</div>
													<div class="mono font-semibold text-sm mt-1">{s.streak ? `${s.streak.result === 'win' ? 'W' : 'L'}${s.streak.count}` : '—'}</div>
												</div>
											</div>
										</div>
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-text-muted text-sm">No tickets yet.</p>
	{/if}
{/snippet}

{#if tip}
	<div
		class="fixed z-50 pointer-events-none rounded-lg border border-border bg-surface shadow-xl shadow-black/20 px-3 py-2 text-xs max-w-[280px]"
		style="left: {tip.x + 14}px; top: {tip.y + 14}px;"
		role="status"
		aria-live="polite"
	>
		<div class="font-bold mb-1">{tip.title}</div>
		{#each tip.rows as row}
			<div class={row.cls ?? 'text-text-muted'}>{row.text}</div>
		{/each}
	</div>
{/if}

<style>
	.mono {
		font-family: 'Roboto Mono', ui-monospace, monospace;
		font-variant-numeric: tabular-nums;
	}

	.perf {
		height: 0;
		border-top: 1px dashed var(--border-c);
		margin: 3.5rem 0;
		position: relative;
	}
	.perf::before,
	.perf::after {
		content: '';
		position: absolute;
		top: -8px;
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: var(--bg);
		border: 1px dashed var(--border-c);
	}
	.perf::before {
		left: -7px;
	}
	.perf::after {
		right: -7px;
	}

	.ticket {
		position: relative;
	}
	.ticket::before,
	.ticket::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		height: 8px;
		background: radial-gradient(circle at 6px 0, var(--bg) 5px, transparent 5.5px) repeat-x;
		background-size: 12px 8px;
	}
	.ticket::before {
		top: -1px;
	}
	.ticket::after {
		bottom: -1px;
		transform: scaleY(-1);
	}

	.meter {
		height: 5px;
		border-radius: 3px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.meter i {
		display: block;
		height: 100%;
		background: var(--accent);
		border-radius: 2px;
	}

	.stamp {
		transform: rotate(-11deg);
	}

	.sk {
		background: var(--surface-3);
		position: relative;
		overflow: hidden;
	}
	.sk::after {
		content: '';
		position: absolute;
		inset: 0;
		transform: translateX(-100%);
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
		animation: sk-shimmer 1.4s infinite;
	}
	@keyframes sk-shimmer {
		100% {
			transform: translateX(100%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sk::after {
			animation: none;
		}
	}
</style>
