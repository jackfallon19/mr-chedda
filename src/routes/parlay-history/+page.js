import parlayHistory from '$lib/data/parlayHistory.json';
import { getLeagueTeamManagers } from '$lib/utils/helper';

export async function load() {
    const leagueTeamManagers = await getLeagueTeamManagers();

    return {
        parlayHistory,
        leagueTeamManagers
    };
}
