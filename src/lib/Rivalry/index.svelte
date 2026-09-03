<script>
	import Matchup from "$lib/Matchups/Matchup.svelte";
	import TradeTransaction from "$lib/Transactions/TradeTransaction.svelte";
	import { getLeagueRecords, getLeagueTransactions, getRivalryMatchups, loadPlayers, round } from "$lib/utils/helper";
	import { getHeadToHeadMatrix } from "$lib/utils/helperFunctions/headToHead";
	import { getRosterIDFromManagerIDAndYear } from "$lib/utils/helperFunctions/universalFunctions";
	import { onMount } from "svelte";
	import ComparissonBar from "./ComparissonBar.svelte";
	import RivalryControls from "./RivalryControls.svelte";
	import HeatMap from "./HeatMap.svelte";

	let { leagueTeamManagers, playersInfo = $bindable(), transactionsInfo = $bindable(), recordsInfo = $bindable(), headToHead = $bindable() } = $props();

	// refresh stale data
	onMount(async () => {
		if(transactionsInfo.stale) {
			transactionsInfo = await getLeagueTransactions(false, true);
		}
		if(playersInfo.stale) {
			playersInfo = await loadPlayers(null, true);
		}
		if(recordsInfo.stale) {
			recordsInfo = await getLeagueRecords(true);
		}
		if(headToHead.stale) {
			headToHead = await getHeadToHeadMatrix(true);
		}
	})

	let playerOne = $state(null);
	let playerTwo = $state(null);

	let rivalry = $state(null);
	let loading = $state(false);

	const selectPair = async (a, b) => {
		playerOne = a;
		playerTwo = b;
		loading = true;
		rivalry = await getRivalryMatchups(a, b);
		loading = false;
		selected = 0;
	}

	const backToHeatMap = () => {
		playerOne = null;
		playerTwo = null;
		rivalry = null;
	}

	let selected = $state(0);

	let matchup = $derived(rivalry?.matchups[selected]?.matchup);
	let displayWeek = $derived(rivalry?.matchups[selected]?.week);
	let year = $derived(rivalry?.matchups[selected]?.year);

	const setTradeHistory = (p1, p2) => {
		if(!p1 || !p2) {
			return [];
		}
		const trades = transactionsInfo.transactions.filter( transaction => {
			if(transaction.type !== "trade") {
				return false;
			}
			const rosterIDOne = parseInt(getRosterIDFromManagerIDAndYear(leagueTeamManagers, p1, transaction.season));
			const rosterIDTwo = parseInt(getRosterIDFromManagerIDAndYear(leagueTeamManagers, p2, transaction.season));
			if(rosterIDOne == rosterIDTwo) {
				return false;
			}
			return transaction.rosters.includes(rosterIDOne) && transaction.rosters.includes(rosterIDTwo);
		});
		const move = (arr, from, to) => {
			arr.splice(to, 0, arr.splice(from, 1)[0]);
		};
		return trades.map(t => {
			const rosterIDOne = parseInt(getRosterIDFromManagerIDAndYear(leagueTeamManagers, p1, t.season));
			const rosterIDTwo = parseInt(getRosterIDFromManagerIDAndYear(leagueTeamManagers, p2, t.season));
			const rosterOneStartLocation = t.rosters.indexOf(rosterIDOne);
			if(rosterOneStartLocation > 0) {
				move(t.rosters, rosterOneStartLocation, 0);
				for(const tradeMove of t.moves) {
					move(tradeMove, rosterOneStartLocation, 0);
				}
			}
			const rosterTwoStartLocation = t.rosters.indexOf(rosterIDTwo);
			const last = t.rosters.length - 1;
			if(rosterTwoStartLocation < last) {
				move(t.rosters, rosterTwoStartLocation, last);
				for(const tradeMove of t.moves) {
					move(tradeMove, rosterTwoStartLocation, last);
				}
			}
			return t;
		})
	}

	let tradeHistory = $derived(setTradeHistory(playerOne, playerTwo));

	const performanceOrderOne = [
		{field: "wins", label: "Wins", unit: "wins"},
		{field: "losses", label: "Losses", unit: "losses"},
		{field: "ties", label: "Ties", unit: "ties"},
	]

	const performanceOrderTwo = [
		{field: "fptsFor", label: "Fantasy Points For", unit: "fpts"},
		{field: "fptsAgainst", label: "Fantasy Points Against", unit: "fpts against"},
	]

	let playerOneRecords = $derived(recordsInfo?.regularSeasonData?.leagueManagerRecords ? recordsInfo.regularSeasonData.leagueManagerRecords[playerOne] : null);
	let playerTwoRecords = $derived(recordsInfo?.regularSeasonData?.leagueManagerRecords ? recordsInfo.regularSeasonData.leagueManagerRecords[playerTwo] : null);
</script>

<div class="max-w-6xl mx-auto px-4 py-8">
	<h1 class="font-display font-black uppercase tracking-tight text-3xl sm:text-4xl mb-6">Who Owns Who?</h1>

	{#if !playerOne || !playerTwo}
		<HeatMap {headToHead} onSelect={selectPair} />
	{:else}
		<button
			class="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
			onclick={backToHeatMap}
		>
			<span class="material-icons text-base">arrow_back</span>
			Back to heat map
		</button>

		{#if loading}
			<div class="max-w-md mx-auto py-20 text-center text-text-muted">
				Analyzing rivalry...
			</div>
		{:else}
			<div class="rounded-2xl border border-border bg-surface p-6 mb-6">
				<h3 class="text-center text-xl font-bold mb-4">Head to Head</h3>
				<ComparissonBar sideOne={rivalry.wins.one} sideTwo={rivalry.wins.two} label="Wins" unit="wins" />
				<ComparissonBar sideOne={parseFloat(round(rivalry.points.one))} sideTwo={parseFloat(round(rivalry.points.two))} label="Points" unit="pts" />

				{#if rivalry?.matchups.length > 0}
					<h3 class="text-center text-xl font-bold mt-8 mb-2">Matchups</h3>
					<RivalryControls bind:selected {year} {displayWeek} length={rivalry.matchups.length} />
					<Matchup key={`${playerOne}-${playerTwo}`} ix={selected} active={selected} {year} {matchup} players={playersInfo.players} {displayWeek} expandOverride={true} {leagueTeamManagers} />
				{/if}
			</div>

			<div class="rounded-2xl border border-border bg-surface p-6 mb-6">
				<h3 class="text-center text-xl font-bold mb-4">Trade History</h3>
				<div class="max-w-2xl mx-auto">
					{#each tradeHistory as transaction }
						<TradeTransaction players={playersInfo.players} {transaction} {leagueTeamManagers} />
					{:else}
						<p class="text-center text-text-muted">No trades yet...</p>
					{/each}
				</div>
			</div>

			{#if playerOneRecords && playerTwoRecords}
				<div class="rounded-2xl border border-border bg-surface p-6">
					<h3 class="text-center text-xl font-bold mb-4">Performance Comparisson</h3>
					<ComparissonBar
						sideOne={parseFloat(round(
							playerOneRecords.wins/(playerOneRecords.wins + playerOneRecords.ties + playerOneRecords.losses) * 100
							))}
						sideTwo={parseFloat(round(
							playerTwoRecords.wins/(playerTwoRecords.wins + playerTwoRecords.ties + playerTwoRecords.losses) * 100
							))}
						label="Win Percentage"
						unit="%"
					/>
					{#each performanceOrderOne as stat }
						<ComparissonBar
							sideOne={parseFloat(round(playerOneRecords[stat.field]))}
							sideTwo={parseFloat(round(playerTwoRecords[stat.field]))}
							label={stat.label}
							unit={stat.unit}
						/>
					{/each}
					<ComparissonBar
						sideOne={parseFloat(round(
							playerOneRecords.fptsFor/(playerOneRecords.wins + playerOneRecords.ties + playerOneRecords.losses)
							))}
						sideTwo={parseFloat(round(
							playerTwoRecords.fptsFor/(playerTwoRecords.wins + playerTwoRecords.ties + playerTwoRecords.losses)
							))}
						label="Fantasy Points per Game"
						unit="fpts/game"
					/>
					{#each performanceOrderTwo as stat }
						<ComparissonBar
							sideOne={parseFloat(round(playerOneRecords[stat.field]))}
							sideTwo={parseFloat(round(playerTwoRecords[stat.field]))}
							label={stat.label}
							unit={stat.unit}
						/>
					{/each}
					<ComparissonBar
						sideOne={parseFloat(round(
							playerOneRecords.fptsFor/playerOneRecords.potentialPoints * 100
							))}
						sideTwo={parseFloat(round(
							playerTwoRecords.fptsFor/playerTwoRecords.potentialPoints * 100
							))}
						label="Lineup IQ"
						unit="%"
					/>
				</div>
			{/if}
		{/if}
	{/if}
</div>
