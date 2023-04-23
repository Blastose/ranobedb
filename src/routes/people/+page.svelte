<script lang="ts">
	import BoxLarge from '$lib/components/box/BoxLarge.svelte';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>People - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<p class="font-bold text-2xl">People</p>

		<div class="box-container">
			{#each data.people as person}
				<BoxLarge name={person.name} href={`/person/${person.id}`} />
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

	@media (min-width: 640px) {
		.box-container {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 768px) {
		.box-container {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1280px) {
		.box-container {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
