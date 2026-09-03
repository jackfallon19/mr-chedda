<script>
	import { goto } from '$app/navigation';
    import { managers } from '$lib/utils/helper';
	import { tabs } from '$lib/utils/tabs';
	import { onMount } from 'svelte';

	let outOfDate = false;

	onMount(async () => {
		const res = await fetch('/api/checkVersion', {compress: true})
		const needUpdate = await res.json();
		outOfDate = needUpdate;
	})

    let managersOutOfDate = false;
    if(managers) {
        for(const manager of managers) {
            if(manager.roster && !manager.managerID) {
                managersOutOfDate = true;
                break;
            }
        }
    }

	const year = new Date().getFullYear();
</script>

<footer class="border-t border-border bg-surface mt-16">
	<div class="max-w-6xl mx-auto px-6 py-10 text-center">
		{#if outOfDate}
			<p class="text-sm italic text-warning mb-2">There is an update available for your League Page. <a class="underline hover:text-text" href="https://github.com/nmelhado/league-page/blob/master/TRAINING_WHEELS.md#iv-updates">Follow the Update Instructions</a> to get all of the newest features!</p>
		{/if}
		{#if managersOutOfDate}
			<p class="text-sm italic text-warning mb-2">Your managers page needs an update, <a class="underline hover:text-text" href="https://github.com/nmelhado/league-page/blob/master/TRAINING_WHEELS.md#2-add-managers">please follow the instructions</a> to get the most up-to-date experience.</p>
		{/if}

		<nav class="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 mb-6 text-sm">
			{#each tabs as tab, i}
				{#if !tab.nest}
					<button class="px-3 py-1 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors" onclick={() => goto(tab.dest)}>{tab.label}</button>
				{:else}
					{#each tab.children as child}
						{#if child.label != "Managers" || managers.length > 0}
							{#if child.label == "Go to Sleeper"}
								<button class="px-3 py-1 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors" onclick={() => window.location = child.dest}>{child.label}</button>
							{:else}
								<button class="px-3 py-1 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors" onclick={() => goto(child.dest)}>{child.label}</button>
							{/if}
						{/if}
					{/each}
				{/if}
			{/each}
		</nav>

		<p class="text-xs text-text-faint">
			&copy; 2021 - {year} <a class="hover:text-text-muted underline" href="https://github.com/nmelhado/league-page">League Page</a>
		</p>
		<p class="text-xs text-text-faint mt-1">
			Built by <a class="hover:text-text-muted underline" href="http://www.nmelhado.com/">Nicholas Melhado</a>
		</p>
		<p class="text-xs text-text-faint mt-1">
			Love League Page? Please consider <a class="hover:text-text-muted underline" href="https://www.buymeacoffee.com/nmelhado">donating</a> to support enhancements or just to say thank you!
		</p>
	</div>
</footer>
