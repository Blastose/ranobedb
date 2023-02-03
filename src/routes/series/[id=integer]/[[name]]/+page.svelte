<script lang="ts">
	import Box from '$lib/components/box/Box.svelte';
	import BookView from '$lib/components/book/BookView.svelte';
	import TopBottomLayout from '$lib/components/layout/TopBottomLayout.svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
	let bookCover = data.series.books[0]?.cover_image_file_name;
</script>

<svelte:head>
	<title>{data.series.title} - RanobeDB</title>
</svelte:head>

<TopBottomLayout backgroundCover={bookCover}>
	<svelte:fragment slot="top">
		<p class="text-xl sm:text-3xl font-bold">{data.series.title}</p>
		<p class="text-lg sm:text-xl font-semibold">{data.series.title_romaji ?? ''}</p>
		<p class="text-sm sm:text-base font-semibold">Series</p>
	</svelte:fragment>

	<svelte:fragment slot="content">
		<div>
			<p class="font-bold">About</p>
			<p>Publication Status: Unknown</p>
			<p>
				Latest Volume Release Date: {data.series.books[data.series.books.length - 1]
					?.release_date ?? 'N/A'}
			</p>
		</div>

		<div class="w-min">
			<Box text={'Edit'} href={`/series/${$page.params.id}/edit`} icon={'pencil'} preload={false} />
		</div>

		<div>
			<p class="font-bold">Books in series</p>
			<BookView books={data.series.books} />
		</div>
	</svelte:fragment>
</TopBottomLayout>
