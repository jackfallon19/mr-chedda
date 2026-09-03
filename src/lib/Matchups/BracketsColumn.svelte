<script>
    import { round } from "$lib/utils/helper";
	import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers } from "$lib/utils/helperFunctions/universalFunctions";

    export let leagueTeamManagers, players, matchCol, playoffsStart, ix, playoffLength, consolation = false, losers = false, numRosters, consolationNum, selected;

    let label = '';

    const setLabel = (l) => {
        if(matchCol.length > 1) {
            switch (playoffLength - ix) {
                case 1:
                    if(losers) {
                        label = 'Dress Yoffs Final'
                    } else {
                        label = 'Dinna Bracket Final'
                    }
                    break;
                case 2:
                    label = 'Semifinals'
                    break;
                case 3:
                    label = 'Quarterfinals'
                    break;
                case 3:
                    label = 'Eighth-Finals'
                    break;
            
                default:
                    break;
            }
        } else {
            // If it's not a consolation match the only single matchup is the final
            if(!consolation) {
                if(losers) {
                    label = 'Dress Yoffs Final'
                } else {
                    label = 'Dinna Bracket Final'
                }
                return;
            }
            if(losers) {
                label = nThPlace(numRosters - (2 * (consolationNum + 1)));
            } else {
                label = nThPlace(1 + (2 * (consolationNum + 1)));
            }
        }
    }

    const nThPlace = (num) => {
        let end = 'th';
        switch (num % 10) {
            case 3:
                end = 'rd'
                break;
            case 2:
                end = 'nd'
                break;
            case 1:
                end = 'st'
                break;
            default:
                break;
        }
        return `${num}${end} Place`
    }

    $: setLabel(losers)

    let anchors = {};
    let drawBracket = false;
    const setDrawBracket = (col) => {
        if(col.length % 2 == 0) {
            drawBracket = true;
        } else {
            drawBracket = false;
        }
    }
    $: setDrawBracket(matchCol)

    const duos = matchCol.length / 2;
    for(let i = 0; i < duos; i++) {
        anchors[i] = {
            t: null,
            b: null,
            yTop: null,
            yBottom: null,
            yMiddle: null,
            xLeft: null,
            xMiddle: null,
            xRight: null,
        }
    }

    const getPlayoffName = (manager, bye, season) => {
        if(bye && !manager) {
            return 'BYE';
        }
        if(!manager) {
            return '';
        }
        return getTeamNameFromTeamManagers(leagueTeamManagers, manager, season);
    }

    const calculatePoints = (allPoints) => {
        let totalPoints = 0;
        for(const k in allPoints) {
            const points = allPoints[k];
            if(!points) break;
            for(const point of points) {
                totalPoints += point;
            }
        }
        return round(totalPoints)
    }

    const calculatePotentialPoints = (startersWeeks, ix, p) => {
        if(!startersWeeks) return 0;
        let totalPoints = 0;
        
        for(const k in startersWeeks) {
            const starters = startersWeeks[k];
            if(!starters) break;

            const i = ix + k -1;
            for(const starter of starters) {
                totalPoints += parseFloat(players[starter]?.wi && players[starter].wi[playoffsStart - i]?.p ? players[starter].wi[playoffsStart - i].p : 0);
            }
        }
        return round(totalPoints);
    }

    let el;

    let labelY = 0;

    const resize = () => {
        const colTop = el?.getBoundingClientRect()?.top || 0;
        const colLeft = el?.getBoundingClientRect()?.left || 0;
        const colRight = el?.getBoundingClientRect()?.right || 0;
        const colWidth = colRight - colLeft;
        for(const key in anchors) {
            const tTop = anchors[key]?.t?.getBoundingClientRect()?.top || 0;
            const tBottom = anchors[key]?.t?.getBoundingClientRect()?.bottom || 0;
            if(labelY == 0 && tTop > 0) {
                labelY = tTop - colTop - 25;
            };

            const tLeft= anchors[key]?.t?.getBoundingClientRect()?.left || 0;
            const tRight= anchors[key]?.t?.getBoundingClientRect()?.right || 0;

            const bTop = anchors[key]?.b?.getBoundingClientRect()?.top || 0;
            const bBottom = anchors[key]?.b?.getBoundingClientRect()?.bottom || 0;
            
            anchors[key].yTop = (tBottom + tTop) / 2 - colTop;
            anchors[key].yBottom = (bBottom + bTop) / 2 - colTop;
            anchors[key].yMiddle = (anchors[key].yTop + anchors[key].yBottom) / 2;

            anchors[key].xLeft = (tRight + tLeft) / 2 - (colWidth * ix);
            anchors[key].xMiddle = anchors[key].xLeft + (colWidth / 2);
            anchors[key].xRight = anchors[key].xLeft + colWidth;
        }
    }

    $: resize(innerWidth);
    
    let innerWidth;

    const changeSelection = (m, opponent) => {
        if(m == selected || !opponent) return;
        selected = m;
    }

</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    .bracketColumn {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        flex-grow: 1;
    }

    .label {
        position: absolute;
        text-align: center;
        margin: 0;
        font-family: var(--font-display);
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        font-size: 0.9em;
        color: var(--text-muted);
    }

    .match {
        width: 220px;
        border: 1px solid var(--border-c);
        background-color: var(--surface);
        border-radius: 14px;
        margin: 1em 0.6em;
        z-index: 2;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }

    .selected {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px var(--primary-dim);
    }

    .clickable {
        cursor: pointer;
    }

    .manager {
        flex-direction: column;
        margin: 0.65em 0.5em;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    .avatarPointsBlock {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .name {
        margin-top: 0.3em;
        font-size: 0.95em;
        font-weight: 600;
        line-height: 1.1em;
        flex-grow: 1;
        word-break: break-word;
        color: var(--text);
        width: 100%;
    }

    .bye {
        color: var(--text-faint);
        font-style: italic;
    }

    .avatar {
        vertical-align: middle;
        border-radius: 50%;
        height: 25px;
        width: 25px;
        margin: 0;
        border: 0.25px solid var(--border-c);
        background-color: var(--surface-2);
    }

    .points {
        line-height: 1.1em;
        font-size: 0.85em;
        padding-left: 1em;
        color: var(--text);
        text-align: right;
    }

    .projectedPoints {
        font-size: 0.8em;
        color: var(--text-faint);
    }

    /* SVG styling */

	.lineParent {
        top: 0;
        left: 0;
        position: absolute;
		overflow: visible;
		width: 1px;
		height: 1px;
		pointer-events: none;
	}

	.line{
        top: 0;
        left: 0;
		position: absolute;
		z-index: 1;
	}

    /* media queries */
	@media (max-width: 1000px) {
        .match {
            width: 180px;
        }
	}

	@media (max-width: 800px) {
        .match {
            width: 150px;
        }
	}

    @media (max-width: 610px) {
        .match {
            width: 120px;
            font-size: 0.9em;
        }

        .avatar {
            height: 20px;
            width: 20px;
        }
    }

    @media (max-width: 500px) {
        .match {
            width: 100px;
            font-size: 0.8em;
        }
    }

    @media (max-width: 410px) {
        .match {
            width: 78px;
            font-size: 0.6em;
        }
    }

    .avatarBye {
        opacity: 0.3;
        border: none;
    }

    .spacer {
        background: none;
        border: none;
    }
</style>

<div class="bracketColumn" bind:this={el}>
    {#if matchCol.length}
        <p class="label" style="top: {labelY}px;">{label}</p>
    {/if}
    <!-- If we need to draw a bracket, include anchor points and include svgs to draw the  bracket -->
    {#each matchCol as matchups, inx}
        <div class="match{matchups[0].m == selected ? ' selected' : ''}{matchups[0].m && matchups[1].roster_id ? ' clickable' : ''}" bind:this={anchors[Math.floor(inx / 2)][inx % 2 == 0 ? 't' : 'b']} onclick={() => {changeSelection(matchups[0].m, matchups[1].roster_id)}}>
            {#each matchups as matchup}
                <div class="manager">
                    <div class="avatarPointsBlock">
                        {#if !matchup.roster_id}
                            <span />
                        {/if}
                        {#if matchup.roster_id || (!matchups.bye && !matchup.roster_id)}
                            <img class="avatar{!matchups.bye && !matchup.roster_id ? ' avatarBye': ''}" src={getAvatarFromTeamManagers(leagueTeamManagers, matchup.roster_id, leagueTeamManagers.currentYear)} alt="team avatar" />
                        {/if}
                        {#if matchup.roster_id}
                            <div class="points">
                                <div class="actualPoints">{calculatePoints(matchup.points)}</div>
                                <div class="projectedPoints">{calculatePotentialPoints(matchup.starters, ix, players)}</div>
                            </div>
                        {:else}
                            <span />
                        {/if}
                    </div>
                    <div class="name{matchups.bye && !matchup.roster_id ? ' bye': ''}">{getPlayoffName(matchup.roster_id, matchups.bye, leagueTeamManagers.currentYear)}</div>
                </div>
            {/each}
        </div>
        {#if drawBracket && inx % 2 == 0}
            <!-- Only draw the bracket once for each pair -->
            <svg class="lineParent">
                <!-- top line of bracket -->
                <line stroke-width="2px" stroke="var(--border-c)"  x1="{anchors[Math.floor(inx / 2)].xLeft}" y1="{anchors[Math.floor(inx / 2)].yTop}" x2="{anchors[Math.floor(inx / 2)].xMiddle}" y2="{anchors[Math.floor(inx / 2)].yTop}" class="line"/>
                <!-- vertical line of bracket -->
                <line stroke-width="2px" stroke="var(--border-c)"  x1="{anchors[Math.floor(inx / 2)].xMiddle}" y1="{anchors[Math.floor(inx / 2)].yTop}" x2="{anchors[Math.floor(inx / 2)].xMiddle}" y2="{anchors[Math.floor(inx / 2)].yBottom}" class="line"/>
                <!-- right line of bracket -->
                <line stroke-width="2px" stroke="var(--border-c)"  x1="{anchors[Math.floor(inx / 2)].xMiddle}" y1="{anchors[Math.floor(inx / 2)].yMiddle}" x2="{anchors[Math.floor(inx / 2)].xRight}" y2="{anchors[Math.floor(inx / 2)].yMiddle}" class="line"/>
                <!-- bottom line of bracket -->
                <line stroke-width="2px" stroke="var(--border-c)"  x1="{anchors[Math.floor(inx / 2)].xLeft}" y1="{anchors[Math.floor(inx / 2)].yBottom}" x2="{anchors[Math.floor(inx / 2)].xMiddle}" y2="{anchors[Math.floor(inx / 2)].yBottom}" class="line"/>
            </svg>
        {/if}
    {:else}
        <div class="match spacer" />
    {/each}
</div>