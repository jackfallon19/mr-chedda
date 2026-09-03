<script>
    import { leagueName } from '$lib/utils/helper';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import { onMount } from 'svelte';
    import Standing from './Standing.svelte';

    let { standingsData, leagueTeamManagersData } = $props();

    // Least important to most important (i.e. the most important [usually wins] goes last)
    // Edit this to match your leagues settings
    const sortOrder = ["fptsAgainst", "divisionTies", "divisionWins", "fpts", "ties", "wins"];

    // Column order from left to right
    const columnOrder = [{name: "W", field: "wins"}, {name: "T", field: "ties"}, {name: "L", field: "losses"}, {name: "Div W", field: "divisionWins"}, {name: "Div T", field: "divisionTies"}, {name: "Div L", field: "divisionLosses"}, {name: "FPTS", field: "fpts"}, {name: "FPTS Against", field: "fptsAgainst"}, {name: "Streak", field: "streak"}]

    let loading = $state(true);
    let preseason = $state(false);
    let standings = $state(null);
    let year = $state(null);
    let leagueTeamManagers = $state(null);

    onMount(async () => {
        const asyncStandingsData = await standingsData;
        if(!asyncStandingsData) {
            loading = false;
            preseason = true;
            return;
        }
        const {standingsInfo, yearData} = asyncStandingsData;
        leagueTeamManagers = await leagueTeamManagersData;
        year = yearData;

        let finalStandings = Object.keys(standingsInfo).map((key) => standingsInfo[key]);

        for(const sortType of sortOrder) {
            if(!finalStandings[0][sortType] && finalStandings[0][sortType] != 0) {
                continue;
            }
            finalStandings = [...finalStandings].sort((a,b) => b[sortType] - a[sortType]);
        }

        standings = finalStandings;
        loading = false;
    })
</script>

<div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="font-display font-black uppercase tracking-tight text-2xl sm:text-3xl mb-6">{year ?? ''} {leagueName} Standings</h1>

    {#if loading}
        <div class="max-w-md mx-auto py-20 text-center text-text-muted">Loading standings...</div>
    {:else if preseason}
        <div class="max-w-md mx-auto py-20 text-center text-text-muted">Preseason, no standings yet</div>
    {:else}
        <div class="rounded-xl border border-border bg-surface overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-border text-xs uppercase tracking-wide text-text-faint">
                        <th class="text-left py-3 pl-4 pr-2 font-semibold">Team</th>
                        {#each columnOrder as column}
                            <th class="text-center py-3 px-3 font-semibold whitespace-nowrap">{column.name}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each standings as standing}
                        <Standing {columnOrder} {standing} {leagueTeamManagers} team={getTeamFromTeamManagers(leagueTeamManagers, standing.rosterID)} />
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
