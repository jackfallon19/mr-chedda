<script>
	import { Icon } from '@smui/tab';
    import Matchup from './Matchup.svelte'
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    export let queryWeek, players, matchupWeeks, year, week, regularSeasonLength, selection, leagueTeamManagers;

    let displayWeek = queryWeek * 1 || 1;

    onMount(() => {
        if(!queryWeek || queryWeek < 1) {
            queryWeek = week;
            displayWeek = queryWeek * 1;
            goto(`/matchups?week=${queryWeek}`, {noscroll: true});
            if(queryWeek > regularSeasonLength) {
                selection = 'champions';
                return;
            }
            processDisplayMatchup(queryWeek)
            return;
        }
        if(queryWeek > regularSeasonLength) {
            selection = 'champions';
            return;
        }
        processDisplayMatchup(displayWeek)
    })

    let matchupArray = [];

    // rand is used as a hacky way to make sure that the each block re-renders when the matchupArray changes
    // the new arrays are too similar to the old ones for Svelte to pick up the difference
    let rand;

    const processDisplayMatchup = (newWeek) => {
        const matchup = matchupWeeks[newWeek-1];
        const allMatchups = matchup.matchups;
        matchupArray = [];
        for (const key in allMatchups) {
            matchupArray.push(allMatchups[key]);
        }
        rand = Math.random();
    }

    let active;
    
    const changeWeek = (newWeek) => {
        displayWeek = newWeek;
        processDisplayMatchup(displayWeek);
        active = null;
        goto(`/matchups?week=${displayWeek}`, {noscroll: true});
    }
</script>

<style>
    .matchups {
        margin: 2em 0 6em;
        max-width: 960px;
        margin-left: auto;
        margin-right: auto;
        padding: 0 1rem;
    }
    .weekContainer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    :global(.changeWeek) {
        font-size: 2em;
        cursor: pointer;
        color: var(--text-faint);
        transition: color 0.15s;
        border-radius: 999px;
    }

    :global(.changeWeek:hover) {
        color: var(--primary);
    }

    .spacer {
        width: 40px;
    }

    .weekText {
        flex-grow: 0;
        text-align: center;
        font-size: 1.75em;
        font-family: var(--font-display);
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: -0.01em;
        color: var(--text);
    }

    @media (max-width: 800px) {
        .weekText {
            font-size: 1.4em;
        }
    }

    @media (max-width: 400px) {
        .weekText {
            font-size: 1.15em;
        }
    }

    @media (max-width: 350px) {
        .weekText {
            font-size: 1.05em;
        }
    }
</style>

<div class="matchups">
    <div class="weekContainer">
        {#if displayWeek > 1}
            <Icon class="material-icons changeWeek" onclick={() => changeWeek(displayWeek - 1)}>chevron_left</Icon>
        {:else}
            <span class="spacer" />
        {/if}
        <h3 class="weekText">{year} Week {displayWeek} Matchups</h3>
        {#if displayWeek < matchupWeeks.length}
            <Icon class="material-icons changeWeek" onclick={() => changeWeek(displayWeek + 1)}>chevron_right</Icon>
        {:else}
            <span class="spacer" />
        {/if}
    </div>
    <div class="flex flex-col gap-4">
        {#each matchupArray as matchup, ix (rand * (ix + 1))}
            <Matchup {ix} {matchup} {players} {displayWeek} bind:active={active} {leagueTeamManagers} />
        {/each}
    </div>
</div>