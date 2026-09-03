<script>
	import { getWinPct, getAvgPointDiff, round } from '$lib/utils/helper';

	/** @type {{headToHead: {managerIDs: string[], managers: Object, matrix: Object}, onSelect?: Function}} */
	let { headToHead, onSelect = () => {} } = $props();

	let metric = $state('winPct'); // 'winPct' | 'pointDiff'

	// order managers by all-time win% (best first) so the grid reads like a ranking, not a random list
	const overallWinPct = (id) => {
		let wins = 0,
			games = 0;
		for (const oppID of headToHead.managerIDs) {
			if (oppID === id) continue;
			const cell = headToHead.matrix[id]?.[oppID];
			if (cell) {
				wins += cell.wins + cell.ties * 0.5;
				games += cell.games;
			}
		}
		return games ? wins / games : -1;
	};

	const orderedIDs = [...headToHead.managerIDs].sort((a, b) => overallWinPct(b) - overallWinPct(a));

	const MIN_GAMES_FOR_COLOR = 1;

	const cellValue = (a, b) => {
		if (a === b) return null;
		const cell = headToHead.matrix[a]?.[b];
		if (!cell || cell.games < MIN_GAMES_FOR_COLOR) return null;
		return metric === 'winPct' ? getWinPct(headToHead.matrix, a, b) : getAvgPointDiff(headToHead.matrix, a, b);
	};

	// map a value to a background color along the loss -> neutral -> win diverging scale
	const colorFor = (a, b) => {
		const cell = headToHead.matrix[a]?.[b];
		if (a === b || !cell || cell.games === 0) return 'var(--surface-2)';

		let t; // 0 = full loss, 0.5 = neutral, 1 = full win
		if (metric === 'winPct') {
			t = getWinPct(headToHead.matrix, a, b);
		} else {
			const diff = getAvgPointDiff(headToHead.matrix, a, b);
			// clamp point differential to +/-40 for color intensity purposes
			t = Math.max(0, Math.min(1, (diff + 40) / 80));
		}

		if (t === null) return 'var(--surface-2)';

		if (t < 0.5) {
			return mix('--heat-loss-strong', '--heat-neutral', t / 0.5);
		}
		return mix('--heat-neutral', '--heat-win-strong', (t - 0.5) / 0.5);
	};

	// naive CSS-variable color mix via color-mix(), supported in all evergreen browsers
	const mix = (fromVar, toVar, pct) => `color-mix(in srgb, var(${fromVar}) ${(1 - pct) * 100}%, var(${toVar}) ${pct * 100}%)`;

	let hovered = $state(null); // { a, b, x, y }

	const showTooltip = (a, b, e) => {
		hovered = { a, b, x: e.clientX, y: e.clientY };
	};
	const moveTooltip = (e) => {
		if (hovered) {
			hovered = { ...hovered, x: e.clientX, y: e.clientY };
		}
	};
	const hideTooltip = () => (hovered = null);

	const cellLabel = (a, b) => {
		const val = cellValue(a, b);
		if (val === null) return '—';
		return metric === 'winPct' ? `${Math.round(val * 100)}%` : (val > 0 ? '+' : '') + round(val);
	};
</script>

<div class="flex justify-end mb-3">
	<div class="inline-flex rounded-lg border border-border overflow-hidden text-xs">
		<button
			class="px-2.5 py-1 transition-colors {metric === 'winPct' ? 'bg-primary text-on-primary' : 'text-text-muted hover:text-text'}"
			onclick={() => (metric = 'winPct')}
		>
			Win %
		</button>
		<button
			class="px-2.5 py-1 transition-colors {metric === 'pointDiff' ? 'bg-primary text-on-primary' : 'text-text-muted hover:text-text'}"
			onclick={() => (metric = 'pointDiff')}
		>
			Point Diff
		</button>
	</div>
</div>

<div class="overflow-x-auto">
	<div class="inline-block min-w-full">
		<div
			class="grid gap-[2px]"
			style="grid-template-columns: 96px repeat({orderedIDs.length}, minmax(34px, 1fr));"
		>
			<!-- header row -->
			<div></div>
			{#each orderedIDs as colID}
				<div class="flex items-end justify-center pb-1 h-[64px]">
					<span
						class="text-[10px] font-medium text-text-muted whitespace-nowrap"
						style="writing-mode: vertical-rl; transform: rotate(180deg);"
					>
						{headToHead.managers[colID]?.name ?? 'Unknown'}
					</span>
				</div>
			{/each}

			{#each orderedIDs as rowID}
				<div class="flex items-center pr-2 text-xs font-medium text-text truncate sticky left-0 bg-bg">
					{headToHead.managers[rowID]?.name ?? 'Unknown'}
				</div>
				{#each orderedIDs as colID}
					{#if rowID === colID}
						<div class="aspect-square rounded-sm bg-transparent"></div>
					{:else}
						<button
							class="aspect-square rounded-sm min-h-[26px] flex items-center justify-center text-[9px] font-bold text-text/80 transition-transform hover:scale-110 hover:z-10 hover:ring-2 hover:ring-text/30 focus:outline-none focus:ring-2 focus:ring-primary"
							style="background-color: {colorFor(rowID, colID)};"
							onmouseenter={(e) => showTooltip(rowID, colID, e)}
							onmousemove={moveTooltip}
							onmouseleave={hideTooltip}
							onclick={() => onSelect(rowID, colID)}
							aria-label="{headToHead.managers[rowID]?.name} vs {headToHead.managers[colID]?.name}"
						>
							{cellLabel(rowID, colID)}
						</button>
					{/if}
				{/each}
			{/each}
		</div>
	</div>
</div>

<p class="mt-2 text-xs text-text-faint">
	Rows = win/point-diff <span class="text-text-muted">for</span> that manager against the column. Click a cell for full matchup history.
</p>

{#if hovered}
	{@const cell = headToHead.matrix[hovered.a]?.[hovered.b]}
	<div
		class="fixed z-50 pointer-events-none rounded-lg border border-border bg-surface-3 shadow-xl px-3 py-2 text-sm"
		style="left: {hovered.x + 14}px; top: {hovered.y + 14}px; max-width: 240px;"
	>
		<div class="font-bold mb-1">
			{headToHead.managers[hovered.a]?.name} vs {headToHead.managers[hovered.b]?.name}
		</div>
		{#if !cell || cell.games === 0}
			<div class="text-text-muted">Not enough data yet — these managers haven't played each other.</div>
		{:else}
			<div class="text-text-muted">
				Record: <span class="text-text font-semibold">{cell.wins}-{cell.losses}{cell.ties ? `-${cell.ties}` : ''}</span>
			</div>
			<div class="text-text-muted">
				Points: <span class="text-text">{round(cell.pointsFor)}</span> for / <span class="text-text">{round(cell.pointsAgainst)}</span> against
			</div>
			{#if cell.largestMargin}
				<div class="text-text-muted">
					Biggest win: <span class="text-text">+{round(cell.largestMargin.margin)}</span> ({cell.largestMargin.year} wk {cell.largestMargin.week})
				</div>
			{/if}
		{/if}
	</div>
{/if}
