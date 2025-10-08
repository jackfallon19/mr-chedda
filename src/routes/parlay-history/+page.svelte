<script>
    import LinearProgress from '@smui/linear-progress';
    import { ParlayHistory } from '$lib/components';

    export let data;
    const { parlayHistory, leagueTeamManagers } = data;
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
    }
</style>

<div id="main">
    <ParlayHistory {parlayHistory} {leagueTeamManagers} />
</div>
