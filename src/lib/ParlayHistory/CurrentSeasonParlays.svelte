<script>
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    import { gotoManager } from '$lib/utils/helper';

    let { season, leagueTeamManagers } = $props();

    // Calculate manager stats
    const calculateManagerStats = () => {
        const stats = {};

        season.weeks.forEach(week => {
            week.picks.forEach(pick => {
                if (!stats[pick.managerID]) {
                    stats[pick.managerID] = {
                        managerID: pick.managerID,
                        managerName: pick.managerName,
                        totalSpent: 0,
                        wins: 0,
                        losses: 0,
                        participated: 0,
                        parlayWins: 0,
                    };
                }

                if (pick.result !== "N/A") {
                    stats[pick.managerID].participated++;
                    stats[pick.managerID].totalSpent += 10;

                    if (pick.result === "win") {
                        stats[pick.managerID].wins++;
                    } else if (pick.result === "loss") {
                        stats[pick.managerID].losses++;
                    }
                }
            });

            if (week.parlayResult === "win") {
                week.picks.forEach(pick => {
                    if (pick.result !== "N/A" && stats[pick.managerID]) {
                        stats[pick.managerID].parlayWins++;
                    }
                });
            }
        });

        // Calculate win percentage
        Object.values(stats).forEach(stat => {
            const totalPicks = stat.wins + stat.losses;
            stat.winPercentage = totalPicks > 0 ? Math.round((stat.wins / totalPicks) * 100) : 0;
        });

        // Sort by total spent (descending)
        return Object.values(stats).sort((a, b) => b.totalSpent - a.totalSpent);
    };

    const managerStats = calculateManagerStats();
</script>

<style>
    h2 {
        text-align: center;
        margin: 2em 0 1em;
        font-size: 2em;
    }

    h3 {
        text-align: center;
        margin: 3em 0 1em;
        font-size: 1.5em;
    }

    :global(.parlayTable) {
        box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 0px 3px 4px 0px var(--boxShadowTwo), 0px 1px 8px 0px var(--boxShadowThree);
        margin: 2em auto;
        max-width: 1200px;
    }

    :global(.headerPrimary) {
        background-color: var(--headerPrimary);
        text-align: center;
    }

    :global(.cellName) {
        cursor: pointer;
        line-height: 1.2em;
        padding-left: 8px;
    }

    :global(.mdc-data-table__cell, .mdc-data-table__header-cell) {
        border-bottom-color: var(--borderOverride);
    }

    .weekHeader {
        margin: 3em 0 1em;
        padding: 1em;
        background-color: var(--fff);
        border-radius: 8px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .weekTitle {
        font-size: 1.3em;
        font-weight: bold;
        margin-bottom: 0.3em;
    }

    .weekInfo {
        font-size: 0.9em;
        color: var(--g999);
    }

    .parlayResult {
        display: inline-block;
        padding: 0.3em 0.8em;
        border-radius: 4px;
        font-weight: bold;
        margin-left: 1em;
    }

    .parlayWin {
        background-color: #4caf50;
        color: white;
    }

    .parlayLoss {
        background-color: #f44336;
        color: white;
    }

    .resultWin {
        color: #4caf50;
        font-weight: bold;
    }

    .resultLoss {
        color: #f44336;
        font-weight: bold;
    }

    .resultNA {
        color: #999;
        font-style: italic;
    }

    /* Responsive table styling */
    @media (max-width: 768px) {
        :global(.parlayTable th) {
            font-size: 0.8em;
            padding: 8px 4px;
        }
        :global(.parlayTable td) {
            font-size: 0.8em;
            padding: 8px 4px;
        }
    }

    @media (max-width: 480px) {
        :global(.parlayTable th) {
            font-size: 0.7em;
            padding: 6px 2px;
        }
        :global(.parlayTable td) {
            font-size: 0.7em;
            padding: 6px 2px;
        }
    }
</style>

<h2>Season {season.year} Summary</h2>

<DataTable class="parlayTable">
    <Head>
        <Row>
            <Cell class="header headerPrimary" colspan=7>Manager Statistics</Cell>
        </Row>
        <Row>
            <Cell class="header">Rank</Cell>
            <Cell class="header">Manager</Cell>
            <Cell class="header">Weeks</Cell>
            <Cell class="header">Spent</Cell>
            <Cell class="header">Pick W/L</Cell>
            <Cell class="header">Win %</Cell>
            <Cell class="header">Parlay Wins</Cell>
        </Row>
    </Head>
    <Body>
        {#each managerStats as stat, ix}
            <Row>
                <Cell>{ix + 1}</Cell>
                <Cell class="cellName" onclick={() => gotoManager({leagueTeamManagers, managerID: stat.managerID})}>
                    {stat.managerName}
                </Cell>
                <Cell>{stat.participated}</Cell>
                <Cell>${stat.totalSpent}</Cell>
                <Cell>{stat.wins}-{stat.losses}</Cell>
                <Cell>{stat.winPercentage}%</Cell>
                <Cell>{stat.parlayWins}</Cell>
            </Row>
        {/each}
    </Body>
</DataTable>

<h3>Weekly Breakdown</h3>

{#each season.weeks as week}
    <div class="weekHeader">
        <div class="weekTitle">
            {week.seasonWeek}
            <span class="parlayResult {week.parlayResult === 'win' ? 'parlayWin' : 'parlayLoss'}">
                {week.parlayResult === 'win' ? 'WON' : 'LOST'}
            </span>
        </div>
        <div class="weekInfo">
            {week.date} • Thrown by {week.thrownBy.managerName}
            {#if week.payout > 0}
                • Payout: ${week.payout}
            {/if}
        </div>
    </div>

    <DataTable class="parlayTable">
        <Head>
            <Row>
                <Cell class="header headerPrimary" colspan=3>Week {week.week} Picks</Cell>
            </Row>
            <Row>
                <Cell class="header">Manager</Cell>
                <Cell class="header">Pick</Cell>
                <Cell class="header">Result</Cell>
            </Row>
        </Head>
        <Body>
            {#each week.picks as pick}
                <Row>
                    <Cell class="cellName" onclick={() => gotoManager({leagueTeamManagers, managerID: pick.managerID})}>
                        {pick.managerName}
                    </Cell>
                    <Cell>{pick.pick}</Cell>
                    <Cell>
                        {#if pick.result === "win"}
                            <span class="resultWin">WIN</span>
                        {:else if pick.result === "loss"}
                            <span class="resultLoss">LOSS</span>
                        {:else}
                            <span class="resultNA">N/A</span>
                        {/if}
                    </Cell>
                </Row>
            {/each}
        </Body>
    </DataTable>
{/each}
