<!-- __layout.svelte -->
<script>
	import "../app.css";
	import { Nav, Footer } from "$lib/components"
    import { dev } from '$app/environment';
    import { injectAnalytics } from '@vercel/analytics/sveltekit';
    import { page } from '$app/state';

    injectAnalytics({ mode: dev ? 'development' : 'production' });
</script>

<main class="min-h-screen flex flex-col">
    <Nav /> <!-- adds the nav (small and large) -->

    <div class="flex-1">
        {#key page.url.pathname}
            <div class="page-transition">
                <slot />
            </div>
        {/key}
    </div>

    <Footer /> <!-- adds the footer -->
</main>