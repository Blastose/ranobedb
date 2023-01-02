<script lang="ts">
	import BookView from '$lib/components/book/BookView.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.series.title}:series - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<div>
			<div>
				<p class="font-bold text-2xl">{data.series.title}</p>
				<p>Series</p>
			</div>
			{#if data.series.title_romaji}
				<p>{data.series.title_romaji}</p>
			{/if}
		</div>
		<BookView books={data.books} />
	</div>
</main>
