<script lang="ts">
	import { page } from '$app/stores';
	import type { UserLabel } from '$lib/server/db/user/list';
	import Label from './Label.svelte';

	export let userLabels: UserLabel[];
	$: activeLabels = $page.url.searchParams.getAll('l').map((v) => Number(v) || 1);
</script>

<nav class="grid">
	<div class="label-container">
		{#each userLabels as userLabel}
			<Label {userLabel} {activeLabels} />
		{/each}
	</div>
</nav>

<style>
	.label-container {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		white-space: nowrap;
	}
</style>
