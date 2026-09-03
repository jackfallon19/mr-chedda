<script>
	import { Rivalry } from '$lib/components'
	import { waitForAll } from '$lib/utils/helper';

	export let data;
	const {
        leagueTeamManagerData,
        playersData,
        transactionsData,
        recordsData,
        headToHeadData,
    } = data;
</script>

<div class="relative z-[1]">
	{#await waitForAll(leagueTeamManagerData, playersData, transactionsData, recordsData, headToHeadData)}
		<div class="max-w-md mx-auto py-24 text-center text-text-muted">
			Gathering information...
		</div>
	{:then [leagueTeamManagers, playersInfo, transactionsInfo, recordsInfo, headToHead]}
		<Rivalry {leagueTeamManagers} {playersInfo} {transactionsInfo} {recordsInfo} {headToHead} />
	{:catch error}
		<p class="text-center text-danger py-24">Something went wrong: {error.message}</p>
	{/await}
</div>
