<script>
    export let year, displayWeek, selected, length;

    const nav = (dir) => {
        if(dir === "left") {
            if(selected > 0) {
                selected--;
            } else {
                selected = length - 1;
            }
        } else {
            if(selected < length - 1) {
                selected++;
            } else {
                selected = 0;
            }
        }
    }
</script>

<div class="flex items-center justify-center gap-2 mb-2">
    {#if length > 0}
        <button
            class="p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
            onclick={() => nav("left")}
            aria-label="Previous matchup"
        >
            <span class="material-icons">chevron_left</span>
        </button>
    {/if}
    <h4 class="text-lg font-bold min-w-[140px] text-center">{year} Week {displayWeek}</h4>
    {#if length > 0}
        <button
            class="p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
            onclick={() => nav("right")}
            aria-label="Next matchup"
        >
            <span class="material-icons">chevron_right</span>
        </button>
    {/if}
</div>
