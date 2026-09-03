<script>
	import { getNflState, leagueName, getAwards, getLeagueTeamManagers, homepageText, managers, gotoManager, waitForAll } from '$lib/utils/helper';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import Button from '$lib/ui/Button.svelte';

    const nflState = getNflState();
    const podiumsData = getAwards();
    const leagueTeamManagersData = getLeagueTeamManagers();

    const dressOdds = [
        { name: 'Enright', odds: '+450' },
        { name: 'Bill', odds: '+500' },
        { name: 'Cam', odds: '+550' },
        { name: 'Boos', odds: '+600' },
        { name: 'Faoro', odds: '+650' },
        { name: 'Riley', odds: '+750' },
        { name: 'Fallon', odds: '+850' },
        { name: 'Nolan', odds: '+1000' },
        { name: 'Lead', odds: '+1100' },
        { name: 'Johnny', odds: '+1200' },
    ];
    const dressOddsLeft = dressOdds.slice(0, 5);
    const dressOddsRight = dressOdds.slice(5);
</script>

<style>
	:global(.curOwner) {
		font-size: 0.75em;
		color: var(--text-faint);
		font-style: italic;
	}
</style>

<!-- hero -->
<section class="relative overflow-hidden px-4 sm:px-8 pt-14 pb-16 border-b border-border">
	<div class="relative max-w-4xl mx-auto text-center">
		<span class="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
			{#await nflState}
				Loading season...
			{:then s}
				NFL {s.season} &middot; {s.season_type === 'pre' ? 'Preseason' : s.season_type === 'post' ? 'Postseason' : (s.week > 0 ? `Week ${s.week}` : 'Preseason')}
			{:catch}
				&nbsp;
			{/await}
		</span>
		<h1 class="font-display font-black uppercase leading-[0.95] tracking-tight text-5xl sm:text-6xl md:text-7xl">
			{leagueName}
		</h1>
		<div class="mt-8 flex items-center justify-center gap-3">
			<Button href="/matchups">
				View Matchups
				<span class="material-icons text-base">arrow_forward</span>
			</Button>
			<Button href="/rivalry" variant="ghost">Head-to-Head</Button>
		</div>
	</div>
</section>

<div class="max-w-[1200px] mx-auto px-4 sm:px-8 py-12">
	<div class="flex flex-col lg:flex-row lg:items-start gap-8">
		<!-- welcome text -->
		<div class="flex-1 min-w-0 text-text-muted leading-relaxed [&_p]:mb-3 [&_p:first-child]:text-xl [&_p:first-child]:font-semibold [&_p:first-child]:text-text">
			{@html homepageText }
		</div>

		<!-- champion / loser history -->
		<div class="w-full lg:w-[420px] lg:shrink-0 space-y-5">
			{#await waitForAll(podiumsData, leagueTeamManagersData)}
				<div class="rounded-3xl border border-border bg-surface p-5 shadow-xl shadow-black/20">
					<p class="text-center text-text-muted text-sm">Retrieving awards...</p>
				</div>
			{:then [podiums, leagueTeamManagers]}
				{#if podiums.length}
					<!-- preseason odds -->
					<div class="rounded-3xl border border-border bg-surface p-5 shadow-xl shadow-black/20">
						<p class="text-xs font-semibold uppercase tracking-widest text-text-faint mb-3">Preseason Dress Odds</p>
						<div class="grid grid-cols-2 gap-x-4">
							<table class="w-full text-sm border-collapse">
								<tbody>
									{#each dressOddsLeft as team}
										<tr class="border-t border-border first:border-t-0">
											<td class="py-2 pr-2 font-semibold text-text">{team.name}</td>
											<td class="py-2 text-right font-bold text-primary">{team.odds}</td>
										</tr>
									{/each}
								</tbody>
							</table>
							<table class="w-full text-sm border-collapse">
								<tbody>
									{#each dressOddsRight as team}
										<tr class="border-t border-border first:border-t-0">
											<td class="py-2 pr-2 font-semibold text-text">{team.name}</td>
											<td class="py-2 text-right font-bold text-primary">{team.odds}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<!-- winners -->
					<div class="rounded-3xl border border-border bg-surface p-5 shadow-xl shadow-black/20">
						<p class="text-xs font-semibold uppercase tracking-widest text-text-faint mb-3">Winner of Dinna with Chedda</p>
						<div class="overflow-x-auto">
							<table class="w-full text-sm border-collapse">
								<tbody>
									{#each podiums as podium, i}
										<tr class="border-t border-border first:border-t-0 {i === 0 ? 'bg-primary-dim/40' : ''}">
											<td class="py-2 pr-3 font-bold {i === 0 ? 'text-primary' : 'text-text'}">{podium.year}</td>
											<td class="py-2">
												<button
													class="text-left font-semibold hover:text-primary transition-colors"
													onclick={() => {if(managers.length) gotoManager({year: podium.year, leagueTeamManagers, rosterID: parseInt(podium.champion)})}}
												>
													{getTeamFromTeamManagers(leagueTeamManagers, podium.champion, podium.year).name}
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<!-- losers -->
					<div class="rounded-3xl border border-border bg-surface p-5 shadow-xl shadow-black/20">
						<p class="text-xs font-semibold uppercase tracking-widest text-text-faint mb-3">Dress Bitch</p>
						<div class="overflow-x-auto">
							<table class="w-full text-sm border-collapse">
								<tbody>
									{#each podiums as podium, i}
										<tr class="border-t border-border first:border-t-0 {i === 0 ? 'bg-primary-dim/40' : ''}">
											<td class="py-2 pr-3 font-bold {i === 0 ? 'text-primary' : 'text-text'}">{podium.year}</td>
											<td class="py-2">
												{#if podium.toilet}
													<button
														class="text-left font-semibold hover:text-primary transition-colors"
														onclick={() => {if(managers.length) gotoManager({year: podium.year, leagueTeamManagers, rosterID: parseInt(podium.toilet)})}}
													>
														{getTeamFromTeamManagers(leagueTeamManagers, podium.toilet, podium.year).name}
													</button>
												{:else}
													<span class="text-text-faint">&mdash;</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{:else}
					<div class="rounded-3xl border border-border bg-surface p-5 shadow-xl shadow-black/20">
						<p class="text-center text-text-muted text-sm">No former champs.</p>
					</div>
				{/if}
			{:catch error}
				<div class="rounded-3xl border border-border bg-surface p-5 shadow-xl shadow-black/20">
					<p class="text-center text-danger text-sm">Something went wrong: {error.message}</p>
				</div>
			{/await}
		</div>
	</div>
</div>
