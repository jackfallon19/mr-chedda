<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import BracketsColumn from "./BracketsColumn.svelte";

    export let leagueTeamManagers, players, brackets, selection, queryWeek;

    const {playoffsStart, champs, losers, numRosters} = brackets;

    const champsBracket = champs.bracket;
    const champsConsolations = champs.consolations;

    const losersBracket = losers.bracket;
    const losersConsolations = losers.consolations;

    let bracket = [];
    let consolations = [];

    onMount(() => {
        if(queryWeek && queryWeek > 0 && queryWeek < playoffsStart) {
            goto(`/matchups?week=1`, {noscroll: true});
            selection = 'regular';
        } else {
            goto(`/matchups?week=${playoffsStart}`, {noscroll: true});
        }
    })

    const changeSelection = () => {
        if(selection == 'losers') {
            bracket = losersBracket;
            consolations = losersConsolations;
        } else {
            bracket = champsBracket;
            consolations = champsConsolations;
        }
        setSelected();
    }

    $: changeSelection(selection);

    let selected;

    const setSelected = () => {
        selected = bracket[0]?.filter(mp => !mp.bye)[0][0].m || null;
    }
</script>

<style>
    .brackets {
        margin: 1.5em 0 4em;
    }

    .bracket {
        margin: 0.5em 0;
        display: flex;
        justify-content: center;
    }
</style>

<div class="brackets">
    <div class="bracket">
        {#each bracket as matchCol, ix}
            <BracketsColumn bind:selected={selected} {leagueTeamManagers} {matchCol} {ix} {players} {playoffsStart} playoffLength={bracket.length} losers={selection == 'losers'} />
        {/each}
    </div>

    {#each consolations as consolation, consolationNum}
        <div class="bracket">
            {#each consolation as matchCol, ix}
                <BracketsColumn bind:selected={selected} {leagueTeamManagers} {consolationNum} {matchCol} {ix} {players} {playoffsStart} playoffLength={consolation.length} {numRosters} consolation={true} losers={selection == 'losers'} />
            {/each}
        </div>
    {/each}
</div>