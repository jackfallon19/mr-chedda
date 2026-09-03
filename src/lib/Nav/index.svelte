<script>
	import NavSmall from './NavSmall.svelte';
	import NavLarge from './NavLarge.svelte';
	import { page } from '$app/state';
	import { leagueName } from '$lib/utils/helper';
</script>

<svelte:head>
	<title>{!page.url.pathname[1] ? 'Home' : page.url.pathname[1].toUpperCase() + page.url.pathname.slice(2)} | League Page</title>
</svelte:head>

<header class="relative flex items-center h-16 px-4 sm:px-8">
	<a href="/" class="flex items-center gap-2 shrink-0">
		<img src="/badge.png" alt="league logo" class="h-9 w-9 object-contain" />
		<span class="hidden sm:block font-display font-extrabold tracking-tight text-lg">{leagueName}</span>
	</a>

	<div class="hidden lg:flex flex-1 justify-center">
		<NavLarge />
	</div>

	<div class="lg:hidden ml-auto">
		<NavSmall />
	</div>
</header>
