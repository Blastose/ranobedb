<script lang="ts">
	export let sectionHeading: string | null = null;
</script>

<section class="sidebar-section">
	{#if sectionHeading}
		<h2 class="sidebar-heading">{sectionHeading}</h2>
	{/if}
	<ul class="sidebar-section">
		<slot />
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
