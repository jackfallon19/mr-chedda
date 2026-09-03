import { getLeagueTeamManagers, loadPlayers, getLeagueTransactions, getLeagueRecords, getHeadToHeadMatrix } from '$lib/utils/helper';

export async function load({fetch}) {

    return {
        leagueTeamManagerData: getLeagueTeamManagers(),
        playersData: loadPlayers(fetch),
        transactionsData: getLeagueTransactions(),
        recordsData: getLeagueRecords(),
        headToHeadData: getHeadToHeadMatrix(),
    };
}
