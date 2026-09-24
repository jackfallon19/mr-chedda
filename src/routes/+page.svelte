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

<!-- masthead -->
<section class="px-4 sm:px-8 pt-16 pb-12 border-b border-border">
	<div class="max-w-[1200px] mx-auto">
		<p class="kicker text-lg sm:text-xl mb-3">
			{#await nflState}
				Loading season&hellip;
			{:then s}
				NFL {s.season} &middot; {s.season_type === 'pre' ? 'Preseason' : s.season_type === 'post' ? 'Postseason' : (s.week > 0 ? `Week ${s.week}` : 'Preseason')}
			{:catch}
				&nbsp;
			{/await}
		</p>
		<h1 class="font-serif font-medium tracking-[-0.03em] leading-[0.92] text-[clamp(3rem,9vw,7rem)] max-w-4xl">
			{leagueName}
		</h1>
		<div class="mt-10 flex flex-wrap items-center gap-3">
			<Button href="/matchups">
				Matchups
				<span class="material-icons text-base">arrow_forward</span>
			</Button>
			<Button href="/rivalry" variant="ghost">Head-to-Head</Button>
			<Button href="/parlay-history" variant="ghost">Parlay History</Button>
		</div>
	</div>
</section>

<div class="max-w-[1200px] mx-auto px-4 sm:px-8 py-12">
	<div class="flex flex-col lg:flex-row lg:items-start gap-x-14 gap-y-12">
		<!-- welcome text -->
		<div class="flex-1 min-w-0 text-text-muted leading-relaxed [&_p]:mb-3 [&_p:first-child]:font-serif [&_p:first-child]:text-2xl [&_p:first-child]:leading-snug [&_p:first-child]:text-text">
			{@html homepageText }
		</div>

		<!-- ledgers -->
		<div class="w-full lg:w-[400px] lg:shrink-0 space-y-10">
			<section>
				<div class="section-head">
					<h2>Preseason Dress Odds</h2>
					<span class="aside">{dressOdds.length} entrants</span>
				</div>
				<div class="grid grid-cols-2 gap-x-8">
					{#each [dressOddsLeft, dressOddsRight] as col, c}
						<table class="ledger w-full text-sm border-collapse">
							<tbody>
								{#each col as team, i}
									<tr>
										<td class="w-5 text-text-faint text-xs">{c * 5 + i + 1}</td>
										<td class="font-medium text-text">{team.name}</td>
										<td class="text-right font-semibold text-primary-hover">{team.odds}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/each}
				</div>
			</section>

			{#await waitForAll(podiumsData, leagueTeamManagersData)}
				<p class="text-text-faint text-sm italic">Retrieving awards&hellip;</p>
			{:then [podiums, leagueTeamManagers]}
				{#if podiums.length}
					{#each [
						{ title: 'Winner of Dinna with Chedda', key: 'champion' },
						{ title: 'Dress Bitch', key: 'toilet' },
					] as list}
						<section>
							<div class="section-head">
								<h2>{list.title}</h2>
							</div>
							<table class="ledger w-full text-sm border-collapse">
								<tbody>
									{#each podiums as podium, i}
										<tr>
											<td class="w-14 {i === 0 ? 'text-primary-hover font-semibold' : 'text-text-faint'}">{podium.year}</td>
											<td>
												{#if podium[list.key]}
													<button
														class="text-left font-medium hover:text-primary-hover transition-colors {i === 0 ? 'text-text' : 'text-text-muted'}"
														onclick={() => {if(managers.length) gotoManager({year: podium.year, leagueTeamManagers, rosterID: parseInt(podium[list.key])})}}
													>
														{getTeamFromTeamManagers(leagueTeamManagers, podium[list.key], podium.year).name}
													</button>
												{:else}
													<span class="text-text-faint">&mdash;</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</section>
					{/each}
				{:else}
					<p class="text-text-muted text-sm italic">No former champs.</p>
				{/if}
			{:catch error}
				<p class="text-danger text-sm">Something went wrong: {error.message}</p>
			{/await}
		</div>
	</div>
</div>
