/**
 * Pure derivations over a single season's parlay data
 * ({ year, weeks: [{ week, seasonWeek, date, parlayResult, payout, thrownBy, picks }] }).
 * No Svelte, no I/O - both the current-season view and any future all-time view
 * should build on these.
 */

/**
 * Bet type inferred from the free-text pick string. Precedence matters - a pick
 * matching an earlier rule never falls through to a later one.
 * @param {string} pick
 * @returns {'Spread'|'Moneyline'|'Total'|'Prop'}
 */
export const betType = (pick) => {
	const p = pick ?? '';
	if (/spread/i.test(p)) return 'Spread';
	if (/\bml\b|moneyline/i.test(p)) return 'Moneyline';
	if (/\bover\b|\bunder\b|\bo\/u\b|\btotal\b/i.test(p)) return 'Total';
	if (/[+-]\d+(\.\d+)?/.test(p)) return 'Spread';
	return 'Prop';
};

/**
 * Every pick a manager has thrown in this season, in week order, with the derived bet type attached.
 * @param {Object} season
 * @param {string} managerID
 */
export const managerLog = (season, managerID) => {
	const weeks = season?.weeks ?? [];
	const log = [];
	for (const week of weeks) {
		const pick = week.picks.find((p) => p.managerID === managerID);
		if (pick) {
			log.push({ week: week.week, year: week.year, seasonWeek: week.seasonWeek, date: week.date, pick, type: betType(pick.pick) });
		}
	}
	return log;
};

/**
 * Every week across every season, flattened into one chronological list and tagged with
 * `year` - the input to the all-time views, which combine every season played so far
 * (today just 2025; 2026 folds in automatically as its weeks get data).
 */
export const flattenWeeks = (seasons) => {
	const list = [];
	for (const season of seasons ?? []) {
		for (const week of season.weeks ?? []) {
			list.push({ ...week, year: season.year });
		}
	}
	return list.sort((a, b) => (a.year === b.year ? a.week - b.week : String(a.year).localeCompare(String(b.year))));
};

/**
 * Current streak (most recent result run to the last week played) for a manager.
 * @returns {{ result: 'win'|'loss', count: number } | null} null if the manager has never played
 */
export const streak = (season, managerID) => {
	const log = managerLog(season, managerID);
	if (!log.length) return null;
	const result = log[log.length - 1].pick.result;
	let count = 0;
	for (let i = log.length - 1; i >= 0 && log[i].pick.result === result; i--) {
		count++;
	}
	return { result, count };
};

/**
 * Longest winning streak a manager has put together this season.
 */
export const bestStreak = (season, managerID) => {
	const log = managerLog(season, managerID);
	let best = 0;
	let current = 0;
	for (const entry of log) {
		current = entry.pick.result === 'win' ? current + 1 : 0;
		best = Math.max(best, current);
	}
	return best;
};

/**
 * A manager's win/loss record broken out by inferred bet type, most-used type first.
 * @returns {Array<[string, { wins: number, total: number }]>}
 */
export const recordByType = (season, managerID) => {
	const log = managerLog(season, managerID);
	const byType = {};
	for (const entry of log) {
		if (!byType[entry.type]) byType[entry.type] = { wins: 0, total: 0 };
		byType[entry.type].total++;
		if (entry.pick.result === 'win') byType[entry.type].wins++;
	}
	return Object.entries(byType).sort((a, b) => b[1].total - a[1].total);
};

/**
 * Per-manager season summary, sorted by win % desc then games played desc - the
 * canonical ranking order used by the heatmap, the win-rate chart, and the ledger.
 * @returns {Array<{ managerID, managerName, weeks, wins, losses, winPct, spent, streak, bestStreak }>}
 */
export const managerStats = (season) => {
	const weeks = season?.weeks ?? [];
	const stats = {};

	for (const week of weeks) {
		if (week.thrownBy?.managerID) {
			const id = week.thrownBy.managerID;
			if (!stats[id]) stats[id] = { managerID: id, managerName: week.thrownBy.managerName, weeks: 0, wins: 0, losses: 0, spent: 0 };
			stats[id].spent += 10;
		}
		for (const pick of week.picks) {
			const id = pick.managerID;
			if (!stats[id]) stats[id] = { managerID: id, managerName: pick.managerName, weeks: 0, wins: 0, losses: 0, spent: 0 };
			stats[id].weeks++;
			if (pick.result === 'win') stats[id].wins++;
			else stats[id].losses++;
		}
	}

	return Object.values(stats)
		.map((s) => ({
			...s,
			winPct: s.wins + s.losses > 0 ? s.wins / (s.wins + s.losses) : 0,
			streak: streak(season, s.managerID),
			bestStreak: bestStreak(season, s.managerID),
		}))
		.sort((a, b) => b.winPct - a.winPct || b.weeks - a.weeks);
};

/**
 * Per-week summary used by the rail, ticket view, and trend chart.
 * @returns {Array<{ week, seasonWeek, date, thrownBy, stake, payout, picks, hit, total, hitRate }>}
 */
export const weekStats = (season) => {
	const weeks = season?.weeks ?? [];
	return weeks.map((w) => {
		const hit = w.picks.filter((p) => p.result === 'win').length;
		const total = w.picks.length;
		return {
			week: w.week,
			seasonWeek: w.seasonWeek,
			date: w.date,
			result: w.parlayResult,
			thrownBy: w.thrownBy,
			stake: 10,
			payout: w.payout,
			picks: w.picks,
			hit,
			total,
			hitRate: total ? hit / total : 0,
		};
	});
};

/**
 * The season's overall parlay ticket record - every ticket in this data set has lost,
 * so this is really just `{ wins: 0, losses: weeks.length }`, but computed rather than assumed.
 */
export const seasonRecord = (season) => {
	const weeks = season?.weeks ?? [];
	const wins = weeks.filter((w) => w.parlayResult === 'win').length;
	return { wins, losses: weeks.length - wins };
};
