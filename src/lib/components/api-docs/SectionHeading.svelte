<script lang="ts">
	interface Props {
		level: 2 | 3;
		id: string;
		label: string;
	}

	let { level, id, label }: Props = $props();
</script>

<div class="doc-heading doc-heading-{level}">
	<svelte:element this={level === 2 ? 'h2' : 'h3'} {id} tabindex="-1" class="doc-title">
		{label}
	</svelte:element>
	<a class="heading-anchor" href={`#${id}`} aria-label={`Link to ${label}`}>
		<span aria-hidden="true">#</span>
	</a>
</div>

<style>
	.doc-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 0.5rem;
	}

	.doc-title {
		margin: 0;
		scroll-margin-top: var(--docs-scroll-margin);
	}

	.doc-heading-2 {
		margin-top: 2rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--docs-border);
	}

	.doc-heading-3 {
		margin-top: 1.75rem;
	}
</style>
