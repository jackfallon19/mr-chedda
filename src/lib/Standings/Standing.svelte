<script>
    import { gotoManager } from '$lib/utils/helper';

    let { columnOrder, team, standing, leagueTeamManagers } = $props();
</script>

<tr class="border-b border-border last:border-0 hover:bg-surface-2/60 transition-colors">
    <td class="py-2.5 pl-4 pr-2">
        <button
            class="flex items-center gap-3 text-left group"
            onclick={() => gotoManager({leagueTeamManagers, rosterID: standing.rosterID})}
        >
            <img alt="team avatar" class="w-9 h-9 rounded-full border border-border object-cover" src="{team.avatar}" />
            <span class="font-medium group-hover:text-primary transition-colors">{team.name}</span>
        </button>
    </td>
    {#each columnOrder as column}
        <td class="text-center py-2.5 px-3 tabular-nums text-text-muted">{standing[column.field]}</td>
    {/each}
</tr>
