<script>
	import { tabs } from '$lib/utils/tabs';
	import { goto, preloadData } from '$app/navigation';
	import { page } from '$app/state';
	import { leagueName } from '$lib/utils/helper';
	import { enableBlog, managers } from '$lib/utils/leagueInfo';

	let active = $state(page.url.pathname);
	let open = $state(false);

	const selectTab = (tab) => {
		open = false;
		goto(tab.dest);
	};
</script>

<button
	class="p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
	aria-label="Open menu"
	onclick={() => (open = true)}
>
	<span class="material-icons text-2xl">menu</span>
</button>

<div
	class="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 {open ? 'opacity-100' : 'opacity-0 pointer-events-none'}"
	onclick={() => (open = false)}
></div>

<aside
	class="fixed left-0 top-0 z-50 h-full w-[280px] max-w-[80vw] overflow-y-auto bg-surface border-r border-border shadow-2xl
		transition-transform duration-300 {open ? 'translate-x-0' : '-translate-x-full'}"
>
	<div class="px-5 py-4 border-b border-border">
		<span class="text-lg font-bold">{leagueName}</span>
	</div>

	<nav class="py-2">
		{#each tabs as tab}
			{#if !tab.nest && (tab.label !== 'Blog' || enableBlog)}
				<a
					href="javascript:void(0)"
					onclick={() => selectTab(tab)}
					onmouseover={() => preloadData(tab.dest)}
					ontouchstart={() => preloadData(tab.dest)}
					class="flex items-center gap-3 px-5 py-3 text-sm transition-colors
						{active === tab.dest ? 'text-primary bg-surface-2' : 'text-text-muted hover:text-text'}"
				>
					<span class="material-icons text-[1.2em]">{tab.icon}</span>
					{tab.label}
				</a>
			{/if}
		{/each}

		{#each tabs as tab}
			{#if tab.nest}
				<div class="mt-3 mb-1 px-5 text-xs font-semibold uppercase tracking-wide text-text-faint">
					{tab.label}
				</div>
				{#each tab.children as subTab}
					{#if (subTab.label !== 'Managers' || managers.length) && (subTab.label !== 'Blog' || enableBlog)}
						<a
							href="javascript:void(0)"
							onclick={() => selectTab(subTab)}
							onmouseover={() => {
								if (subTab.label !== 'Go to Sleeper') preloadData(subTab.dest);
							}}
							ontouchstart={() => {
								if (subTab.label !== 'Go to Sleeper') preloadData(subTab.dest);
							}}
							class="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors
								{active === subTab.dest ? 'text-primary bg-surface-2' : 'text-text-muted hover:text-text'}"
						>
							<span class="material-icons text-[1.1em]">{subTab.icon}</span>
							{subTab.label}
						</a>
					{/if}
				{/each}
			{/if}
		{/each}
	</nav>
</aside>
