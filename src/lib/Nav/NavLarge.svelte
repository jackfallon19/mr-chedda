<script>
	import { tabs } from '$lib/utils/tabs';
	import { page } from '$app/state';
	import { preloadData } from '$app/navigation';
	import { enableBlog, managers } from '$lib/utils/leagueInfo';

	let openNest = $state(false);

	const isActive = (tab) =>
		tab.dest === page.url.pathname ||
		(tab.nest && tab.children.some((c) => c.dest === page.url.pathname));
</script>

<nav class="relative flex items-center gap-1">
	{#each tabs as tab}
		{#if !tab.nest}
			{#if tab.label !== 'Blog' || enableBlog}
				<a
					href={tab.dest}
					onmouseover={() => preloadData(tab.dest)}
					ontouchstart={() => preloadData(tab.dest)}
					class="px-3.5 py-2 border-b-2 text-sm font-medium transition-colors
						{isActive(tab) ? 'text-text border-text' : 'text-text-muted border-transparent hover:text-text'}"
				>
					{tab.label}
				</a>
			{/if}
		{:else}
			<div
				class="relative"
				onmouseenter={() => (openNest = true)}
				onmouseleave={() => (openNest = false)}
			>
				<button
					class="px-3.5 py-2 border-b-2 text-sm font-medium transition-colors inline-flex items-center gap-1
						{isActive(tab) ? 'text-text border-text' : 'text-text-muted border-transparent hover:text-text'}"
					onclick={() => (openNest = !openNest)}
				>
					{tab.label}
					<span class="material-icons text-base transition-transform {openNest ? 'rotate-180' : ''}">expand_more</span>
				</button>
				<div
					class="absolute left-1/2 top-full z-20 -translate-x-1/2 pt-3 transition-all duration-150
						{openNest ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'}"
				>
					<div class="min-w-[220px] rounded-sm border border-text bg-surface py-1.5">
						{#each tab.children as subTab}
							{#if (subTab.label !== 'Managers' || managers.length) && (subTab.label !== 'Blog' || enableBlog)}
								<a
									href={subTab.dest}
									onmouseover={() => {
										if (subTab.label !== 'Go to Sleeper') preloadData(subTab.dest);
									}}
									class="flex items-center gap-3 px-4 py-2 text-sm transition-colors
										{page.url.pathname === subTab.dest ? 'text-primary bg-surface-2' : 'text-text-muted hover:text-text hover:bg-surface-2'}"
								>
									<span class="material-icons text-[1.1em]">{subTab.icon}</span>
									{subTab.label}
								</a>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{/each}
</nav>
