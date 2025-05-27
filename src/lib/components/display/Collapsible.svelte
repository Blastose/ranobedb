<script lang="ts">
	interface Props {
		open: boolean;
		summary?: import('svelte').Snippet;
		details?: import('svelte').Snippet;
	}

	let { open, summary, details }: Props = $props();
</script>

<details {open}>
	<summary class="cursor-pointer w-fit">{@render summary?.()}</summary>
	{@render details?.()}
</details>

<style>
	summary > :global(h1),
	summary > :global(h2),
	summary > :global(h3),
	summary > :global(h4),
	summary > :global(h5),
	summary > :global(h6) {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}
</style>
