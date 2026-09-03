
<script>
	import LinearProgress from '@smui/linear-progress';
	import MatchupWeeks from './MatchupWeeks.svelte';
	import Brackets from './Brackets.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { loadPlayers } from '$lib/utils/helper';

	export let queryWeek, leagueTeamManagersData, matchupsData, bracketsData, playersData;

    let players, matchupWeeks, year, week, regularSeasonLength, brackets, leagueTeamManagers;

    let loading = true;

    onMount(async () => {
        brackets = await bracketsData;
        const matchupsInfo = await matchupsData;
        leagueTeamManagers = await leagueTeamManagersData;
        matchupWeeks = matchupsInfo.matchupWeeks;
        year = matchupsInfo.year;
        week = matchupsInfo.week;
        regularSeasonLength = matchupsInfo.regularSeasonLength;
        const playersInfo = await playersData;
        players = playersInfo.players;
        loading = false;

        if(playersInfo.stale) {
            const newPlayersInfo = await loadPlayers(null, true);
            players = newPlayersInfo.players;
        }
    });

    const changeSelection = (s) => {
        if(s == 'regular') {
            queryWeek = 1;
            goto(`/matchups?week=1`, {noscroll: true});
        } else if(selection == 'regular') {
            queryWeek = 99;
            goto(`/matchups?week=99`, {noscroll: true});
        }
        selection = s;
    }

    let selection = 'regular';
</script>

<style>
    .message {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }
</style>



{#if loading}
    <!-- promise is pending -->
    <div class="message">
        <p>Loading league matchups...</p>
        <LinearProgress indeterminate />
    </div>
{:else}
    {#if matchupWeeks.length}
        <div class="flex flex-col items-center gap-3 my-8">
            <div class="inline-flex rounded-full border border-border bg-surface p-1 shadow-sm">
                <button
                    class="px-6 py-2.5 rounded-full font-display text-sm font-extrabold uppercase tracking-wide transition-colors {selection == 'regular' ? 'bg-primary text-on-primary shadow' : 'text-text-muted hover:text-text'}"
                    onclick={() => changeSelection('regular')}
                >
                    Regular Season
                </button>
                <button
                    class="px-6 py-2.5 rounded-full font-display text-sm font-extrabold uppercase tracking-wide transition-colors {selection == 'champions' || selection == 'losers' ? 'bg-primary text-on-primary shadow' : 'text-text-muted hover:text-text'}"
                    onclick={() => changeSelection('champions')}
                >
                    Playoffs
                </button>
            </div>
            {#if selection == 'champions' || selection == 'losers'}
                <div class="inline-flex rounded-full border border-border bg-surface p-1 shadow-sm">
                    <button
                        class="px-6 py-2.5 rounded-full font-display text-sm font-extrabold uppercase tracking-wide transition-colors {selection == 'champions' ? 'bg-primary text-on-primary shadow' : 'text-text-muted hover:text-text'}"
                        onclick={() => changeSelection('champions')}
                    >
                        Dinna Bracket
                    </button>
                    <button
                        class="px-6 py-2.5 rounded-full font-display text-sm font-extrabold uppercase tracking-wide transition-colors {selection == 'losers' ? 'bg-primary text-on-primary shadow' : 'text-text-muted hover:text-text'}"
                        onclick={() => changeSelection('losers')}
                    >
                        Dress Yoffs
                    </button>
                </div>
            {/if}
        </div>
        {#if selection == 'regular'}
            <MatchupWeeks {players} {queryWeek} {matchupWeeks} {regularSeasonLength} {year} {week} bind:selection={selection} {leagueTeamManagers} />
        {/if}
    {:else}
        <div class="message">
            <p>No upcoming matchups...</p>
        </div>
    {/if}
    <!-- {promise has processed -->
    {#if brackets.champs.bracket[0][0][0].points && (selection == 'champions' || selection == 'losers')}
        <Brackets {queryWeek} {leagueTeamManagers} {players} {brackets} bind:selection={selection} />
    {/if}
{/if}