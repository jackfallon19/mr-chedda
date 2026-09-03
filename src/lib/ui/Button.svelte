<script>
	let { href = null, variant = 'primary', class: className = '', children, ...rest } = $props();

	const base = 'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]';
	const variants = {
		primary: 'bg-primary text-on-primary hover:bg-primary-hover shadow-lg shadow-primary/20',
		ghost: 'bg-surface-2 text-text hover:bg-surface-3 border border-border',
		outline: 'border border-primary/50 text-primary hover:bg-primary/10',
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
