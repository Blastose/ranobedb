<script lang="ts">
	interface Props {
		sectionHeading?: string | null;
		children?: import('svelte').Snippet;
	}

	let { sectionHeading = null, children }: Props = $props();
</script>

<section class="sidebar-section">
	{#if sectionHeading}
		<h2 class="sidebar-heading">{sectionHeading}</h2>
	{/if}
	<ul class="sidebar-section">
		{@render children?.()}
	</ul>
</section>

<style>
	.sidebar-section {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.sidebar-heading {
		padding: 0 0.25rem;
		font-size: 1.125rem;
		line-height: 1.75rem;
		font-weight: 700;
	}
</style>
