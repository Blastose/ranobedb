<script lang="ts">
	import BoxLarge from '$lib/components/box/BoxLarge.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Releases - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<p class="font-bold text-2xl">Releases</p>

		<div class="box-container">
			{#each data.releases as release}
				<BoxLarge name={release.name} href={`/release/${release.id}`} />
			{/each}
		</div>
	</div>
</main>

<style>
	.box-container {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 1rem;
	}
</style>
