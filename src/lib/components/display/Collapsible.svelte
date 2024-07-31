<script lang="ts">
	export let open: boolean;
</script>

<details {open}>
	<summary class="cursor-pointer"><slot name="summary"></slot></summary>
	<slot name="details"></slot>
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
		gap: 0.5rem;
	}
</style>
