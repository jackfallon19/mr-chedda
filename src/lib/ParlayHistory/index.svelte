<script>
    import Button, { Group, Label } from '@smui/button';
    import AllTimeParlays from './AllTimeParlays.svelte';
    import CurrentSeasonParlays from './CurrentSeasonParlays.svelte';

    let { parlayHistory, leagueTeamManagers } = $props();

    let display = $state("current");

    // Get current season (most recent year)
    const currentSeason = parlayHistory.seasons[0];
    const allSeasons = parlayHistory.seasons;
</script>

<style>
    .parlayWrapper {
        margin: 0 auto;
        width: 100%;
        max-width: 1400px;
        padding: 20px;
    }

    h1 {
        text-align: center;
        margin: 1.5em 0 0.5em;
        font-size: 2.5em;
    }

    .subtitle {
        text-align: center;
        font-style: italic;
        color: var(--g999);
        margin-bottom: 2em;
    }

    .empty {
        margin: 10em 0 4em;
        text-align: center;
    }

    .buttonHolder {
        text-align: center;
        margin: 2em 0 3em;
    }

    /* Start button resizing */

    @media (max-width: 540px) {
        :global(.buttonHolder .selectionButtons) {
            font-size: 0.6em;
        }
    }

    @media (max-width: 415px) {
        :global(.buttonHolder .selectionButtons) {
            font-size: 0.5em;
            padding: 0 6px;
        }
    }

    @media (max-width: 315px) {
        :global(.buttonHolder .selectionButtons) {
            font-size: 0.45em;
            padding: 0 3px;
        }
    }

    /* End button resizing */
</style>

<div class="parlayWrapper">
    <h1>Weekly Parlay History</h1>
    <p class="subtitle">Track every manager's picks, wins, losses, and cumulative spending</p>

    <div class="buttonHolder">
        <Group variant="outlined">
            <Button class="selectionButtons" onclick={() => display = "current"} variant="{display == "current" ? "raised" : "outlined"}">
                <Label>Current Season ({currentSeason.year})</Label>
            </Button>
            <Button class="selectionButtons" onclick={() => display = "allTime"} variant="{display == "allTime" ? "raised" : "outlined"}">
                <Label>All-Time Stats</Label>
            </Button>
        </Group>
    </div>

    {#if display == "current"}
        {#if currentSeason.weeks?.length}
            <CurrentSeasonParlays season={currentSeason} {leagueTeamManagers} />
        {:else}
            <p class="empty">No parlay data for this season <i>yet</i>...</p>
        {/if}
    {:else}
        <AllTimeParlays {allSeasons} {leagueTeamManagers} />
    {/if}
</div>
