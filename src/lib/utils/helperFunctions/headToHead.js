import { getLeagueData } from './leagueData';
import { leagueID } from '$lib/utils/leagueInfo';
import { getLeagueTeamManagers } from './leagueTeamManagers';
import { waitForAll } from './multiPromise';
import { get } from 'svelte/store';
import { headToHeadStore } from '$lib/stores';
import { browser } from '$app/environment';

/**
 * Walks the league's entire history ONE time and builds a full pairwise
 * head-to-head matrix for every manager who has ever been in the league.
 * This replaces calling getRivalryMatchups() once per pair (O(n^2) season
 * walks) with a single O(n) walk that produces every pair at once.
 *
 * @param {bool} refresh if false, returns the matrix cached in localStorage when available
 * @returns {Object} { managerIDs, managers, matrix }
 *   managerIDs: string[] - every manager who has ever rostered a team, most-recently-active first
 *   managers: { [managerID]: { name, avatar } }
 *   matrix: { [managerID]: { [opponentManagerID]: HeadToHeadCell } }
 *   HeadToHeadCell: { games, wins, losses, ties, pointsFor, pointsAgainst, largestMargin: { margin, week, year } | null }
 */
export const getHeadToHeadMatrix = async (refresh = false) => {
	if (get(headToHeadStore).matrix) {
		return get(headToHeadStore);
	}

	if (!refresh && browser) {
		const cached = JSON.parse(localStorage.getItem('headToHead') ?? 'null');
		if (cached && cached.matrix) {
			cached.stale = true;
			return cached;
		}
	}

	const teamManagers = await getLeagueTeamManagers().catch((err) => {
		console.error(err);
	});

	const matrix = {};
	const managers = {};
	const managerOrder = [];

	const ensureManager = (managerID, year) => {
		if (!managerID) return;
		if (!matrix[managerID]) {
			matrix[managerID] = {};
			managerOrder.push(managerID);
		}
		const user = teamManagers.users[managerID];
		if (user && (!managers[managerID] || year >= (managers[managerID].lastYear ?? 0))) {
			managers[managerID] = {
				name: user.display_name,
				avatar: user.metadata?.avatar
					? user.metadata.avatar
					: user.avatar
						? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
						: null,
				lastYear: year,
			};
		}
	};

	const ensureCell = (a, b) => {
		if (!matrix[a][b]) {
			matrix[a][b] = { games: 0, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0, largestMargin: null };
		}
		return matrix[a][b];
	};

	const recordResult = (managerA, managerB, week, year, pointsA, pointsB) => {
		ensureManager(managerA, year);
		ensureManager(managerB, year);
		const cellA = ensureCell(managerA, managerB);
		const cellB = ensureCell(managerB, managerA);

		cellA.games++;
		cellB.games++;
		cellA.pointsFor += pointsA;
		cellA.pointsAgainst += pointsB;
		cellB.pointsFor += pointsB;
		cellB.pointsAgainst += pointsA;

		if (pointsA > pointsB) {
			cellA.wins++;
			cellB.losses++;
		} else if (pointsB > pointsA) {
			cellB.wins++;
			cellA.losses++;
		} else {
			cellA.ties++;
			cellB.ties++;
		}

		const margin = Math.abs(pointsA - pointsB);
		const winningCell = pointsA > pointsB ? cellA : pointsB > pointsA ? cellB : null;
		if (winningCell && (!winningCell.largestMargin || margin > winningCell.largestMargin.margin)) {
			winningCell.largestMargin = { margin, week, year };
		}
	};

	let curLeagueID = leagueID;
	while (curLeagueID && curLeagueID != 0) {
		const leagueData = await getLeagueData(curLeagueID).catch((err) => {
			console.error(err);
		});
		if (!leagueData) break;

		const year = parseInt(leagueData.season);
		const rosterManager = {};
		for (const rosterID in teamManagers.teamManagersMap[year] ?? {}) {
			const rosterManagers = teamManagers.teamManagersMap[year][rosterID].managers;
			if (rosterManagers?.length) {
				rosterManager[rosterID] = rosterManagers[0];
			}
		}

		const matchupsPromises = [];
		for (let week = 1; week < leagueData.settings.playoff_week_start; week++) {
			matchupsPromises.push(
				fetch(`https://api.sleeper.app/v1/league/${curLeagueID}/matchups/${week}`, { compress: true })
			);
		}
		const matchupsRes = await waitForAll(...matchupsPromises).catch((err) => {
			console.error(err);
		});

		const matchupsJsonPromises = (matchupsRes ?? []).map((res) => res.json());
		const matchupsData = await waitForAll(...matchupsJsonPromises).catch((err) => {
			console.error(err);
		});

		for (let i = 0; i < (matchupsData?.length ?? 0); i++) {
			const week = i + 1;
			const weekMatchups = matchupsData[i];
			if (!weekMatchups) continue;

			const grouped = {};
			for (const entry of weekMatchups) {
				if (!grouped[entry.matchup_id]) grouped[entry.matchup_id] = [];
				grouped[entry.matchup_id].push(entry);
			}

			for (const matchupID in grouped) {
				const sides = grouped[matchupID];
				if (sides.length !== 2) continue;
				const [sideA, sideB] = sides;
				const managerA = rosterManager[sideA.roster_id];
				const managerB = rosterManager[sideB.roster_id];
				if (!managerA || !managerB || managerA === managerB) continue;
				recordResult(managerA, managerB, week, year, sideA.points ?? 0, sideB.points ?? 0);
			}
		}

		curLeagueID = leagueData.previous_league_id;
	}

	const response = {
		managerIDs: managerOrder,
		managers,
		matrix,
	};

	headToHeadStore.update(() => response);
	if (browser) {
		localStorage.setItem('headToHead', JSON.stringify(response));
	}

	return response;
};

/**
 * Convenience helper: win percentage for managerA against managerB, or null if they've never played.
 */
export const getWinPct = (matrix, managerA, managerB) => {
	const cell = matrix?.[managerA]?.[managerB];
	if (!cell || cell.games === 0) return null;
	return (cell.wins + cell.ties * 0.5) / cell.games;
};

/**
 * Convenience helper: average point differential per game for managerA against managerB.
 */
export const getAvgPointDiff = (matrix, managerA, managerB) => {
	const cell = matrix?.[managerA]?.[managerB];
	if (!cell || cell.games === 0) return null;
	return (cell.pointsFor - cell.pointsAgainst) / cell.games;
};
