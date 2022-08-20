<script lang="ts">
	import type Release from '$lib/models/release';
	import ReleaseCard from './ReleaseCard.svelte';
	export let releases: Release[];
</script>

<div class="flex flex-col gap-2">
	{#each releases as release (release.id)}
		<ReleaseCard {release} />
	{/each}
</div>
