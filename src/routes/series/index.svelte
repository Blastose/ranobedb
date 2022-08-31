<script lang="ts">
	import type SeriesInfo from '$lib/models/seriesInfo';
	import SeriesCardContainer from '$lib/series/SeriesCardContainer.svelte';
	export let series: SeriesInfo[];
</script>

<svelte:head><title>Series - RanobeDB</title></svelte:head>

<main class="container mx-auto px-8 pt-4 pb-8 duration-150">
	<div class="flex flex-col gap-2">
		<div class="flex flex-col">
			<span class="font-bold text-2xl">Series</span>
		</div>
		<div class="flex flex-col gap-2">
			<span>{series.length} series</span>
			<SeriesCardContainer {series} />
		</div>
	</div>
</main>
