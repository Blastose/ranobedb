<script lang="ts">
	import BoxLarge from '$lib/components/box/BoxLarge.svelte';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Series - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<p class="font-bold text-2xl">Series</p>

		<div class="box-container">
			{#each data.series as s}
				<BoxLarge name={s.title} href={`/series/${s.id}`} />
			{/each}
		</div>
		<Pagination totalPages={data.totalPages} />
	</div>
</main>

<style>
	.box-container {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 1rem;
	}
</style>
