<script lang="ts">
	import type { UserLabel } from '$lib/server/db/user/list';
	import Label from './Label.svelte';

	interface Props {
		userLabels: UserLabel[];
		activeLabels: number[];
	}

	let { userLabels, activeLabels }: Props = $props();
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
		overflow-y: hidden;
		white-space: nowrap;
	}
</style>
