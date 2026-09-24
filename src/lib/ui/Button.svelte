<script>
	let { href = null, variant = 'primary', class: className = '', children, ...rest } = $props();

	const base = 'inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold transition-colors duration-150';
	const variants = {
		primary: 'bg-text text-bg hover:bg-primary-hover',
		ghost: 'border border-text text-text hover:bg-text hover:text-bg',
		outline: 'border border-primary text-primary-hover hover:bg-primary-dim',
	};
</script>

{#if href}
	<a {href} class="{base} {variants[variant]} {className}" {...rest}>
		{@render children?.()}
	</a>
{:else}
	<button class="{base} {variants[variant]} {className}" {...rest}>
		{@render children?.()}
	</button>
{/if}
