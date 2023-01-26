<script lang="ts">
	import Box from '$lib/components/box/Box.svelte';
	import BookView from '$lib/components/book/BookView.svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.series.title} - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-4">
		<div>
			<div>
				<p class="font-bold text-2xl">{data.series.title}</p>
				{#if data.series.title_romaji}
					<p>{data.series.title_romaji}</p>
				{/if}
				<p>Series</p>
			</div>
		</div>
		<div>
			<p>Publication Status: Unknown</p>
			<p>Latest Volume Release Date: {data.books[data.books.length - 1]?.release_date ?? 'N/A'}</p>
		</div>
		<div class="w-min">
			<Box text={'Edit'} href={`/series/${$page.params.id}/edit`} icon={'pencil'} preload={false} />
		</div>
		<BookView books={data.books} />
	</div>
</main>
