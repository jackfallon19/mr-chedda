<script>
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    import { gotoManager } from '$lib/utils/helper';

    let { allSeasons, leagueTeamManagers } = $props();

    // Calculate all-time manager stats across all seasons
    const calculateAllTimeStats = () => {
        const stats = {};

        allSeasons.forEach(season => {
            season.weeks?.forEach(week => {
                // Only charge the person who threw the parlay
                if (week.thrownBy) {
                    if (!stats[week.thrownBy.managerID]) {
                        stats[week.thrownBy.managerID] = {
                            managerID: week.thrownBy.managerID,
                            managerName: week.thrownBy.managerName,
                            totalSpent: 0,
                            wins: 0,
                            losses: 0,
                            participated: 0,
                            parlayWins: 0,
                        };
                    }
                    stats[week.thrownBy.managerID].totalSpent += 10;
                }

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
        });

        // Calculate win percentage
        Object.values(stats).forEach(stat => {
            const totalPicks = stat.wins + stat.losses;
            stat.winPercentage = totalPicks > 0 ? Math.round((stat.wins / totalPicks) * 100) : 0;
        });

        // Sort by win percentage (descending), then by total spent as tiebreaker
        return Object.values(stats).sort((a, b) => {
            if (b.winPercentage !== a.winPercentage) {
                return b.winPercentage - a.winPercentage;
            }
            return b.totalSpent - a.totalSpent;
        });
    };

    // Calculate season summaries
    const calculateSeasonSummaries = () => {
        return allSeasons.map(season => {
            const totalWeeks = season.weeks?.length || 0;
            const parlayWins = season.weeks?.filter(w => w.parlayResult === "win").length || 0;
            const parlayLosses = totalWeeks - parlayWins;
            const totalPayout = season.weeks?.reduce((sum, w) => sum + (w.payout || 0), 0) || 0;

            return {
                year: season.year,
                totalWeeks,
                parlayWins,
                parlayLosses,
                totalPayout,
                winPercentage: totalWeeks > 0 ? Math.round((parlayWins / totalWeeks) * 100) : 0,
            };
        }).filter(s => s.totalWeeks > 0); // Only show seasons with data
    };

    const allTimeStats = calculateAllTimeStats();
    const seasonSummaries = calculateSeasonSummaries();

    // Calculate overall parlay stats
    const totalParlays = seasonSummaries.reduce((sum, s) => sum + s.totalWeeks, 0);
    const totalParlayWins = seasonSummaries.reduce((sum, s) => sum + s.parlayWins, 0);
    const totalPayout = seasonSummaries.reduce((sum, s) => sum + s.totalPayout, 0);
</script>

<style>
    h2 {
        text-align: center;
        margin: 2em 0 1em;
        font-size: 2em;
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

    .statsGrid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5em;
        margin: 2em auto;
        max-width: 1200px;
    }

    .statCard {
        background-color: var(--fff);
        padding: 1.5em;
        border-radius: 8px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .statValue {
        font-size: 2.5em;
        font-weight: bold;
        color: var(--headerPrimary);
        margin: 0.2em 0;
    }

    .statLabel {
        font-size: 0.9em;
        color: var(--g999);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .empty {
        margin: 4em 0;
        text-align: center;
        font-style: italic;
        color: var(--g999);
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
        .statsGrid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1em;
        }
        .statValue {
            font-size: 2em;
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
        .statsGrid {
            grid-template-columns: 1fr;
        }
    }
</style>

<h2>All-Time Overview</h2>

{#if totalParlays > 0}
    <div class="statsGrid">
        <div class="statCard">
            <div class="statValue">{totalParlays}</div>
            <div class="statLabel">Total Parlays</div>
        </div>
        <div class="statCard">
            <div class="statValue">{totalParlayWins}</div>
            <div class="statLabel">Parlay Wins</div>
        </div>
        <div class="statCard">
            <div class="statValue">{totalParlays > 0 ? Math.round((totalParlayWins / totalParlays) * 100) : 0}%</div>
            <div class="statLabel">Win Rate</div>
        </div>
        <div class="statCard">
            <div class="statValue">${totalPayout}</div>
            <div class="statLabel">Total Winnings</div>
        </div>
    </div>
{/if}

<h2>All-Time Manager Rankings</h2>

{#if allTimeStats.length > 0}
    <DataTable class="parlayTable">
        <Head>
            <Row>
                <Cell class="header headerPrimary" colspan=7>Cumulative Manager Statistics</Cell>
            </Row>
            <Row>
                <Cell class="header">Rank</Cell>
                <Cell class="header">Manager</Cell>
                <Cell class="header">Total Weeks</Cell>
                <Cell class="header">Total Spent</Cell>
                <Cell class="header">Pick W/L</Cell>
                <Cell class="header">Win %</Cell>
                <Cell class="header">Parlay Wins</Cell>
            </Row>
        </Head>
        <Body>
            {#each allTimeStats as stat, ix}
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
{:else}
    <p class="empty">No all-time data available yet.</p>
{/if}

{#if seasonSummaries.length > 0}
    <h2>Season-by-Season Breakdown</h2>

    <DataTable class="parlayTable">
        <Head>
            <Row>
                <Cell class="header headerPrimary" colspan=6>Parlay Performance by Season</Cell>
            </Row>
            <Row>
                <Cell class="header">Season</Cell>
                <Cell class="header">Total Parlays</Cell>
                <Cell class="header">Wins</Cell>
                <Cell class="header">Losses</Cell>
                <Cell class="header">Win %</Cell>
                <Cell class="header">Total Payout</Cell>
            </Row>
        </Head>
        <Body>
            {#each seasonSummaries as summary}
                <Row>
                    <Cell>{summary.year}</Cell>
                    <Cell>{summary.totalWeeks}</Cell>
                    <Cell>{summary.parlayWins}</Cell>
                    <Cell>{summary.parlayLosses}</Cell>
                    <Cell>{summary.winPercentage}%</Cell>
                    <Cell>${summary.totalPayout}</Cell>
                </Row>
            {/each}
        </Body>
    </DataTable>
{/if}
