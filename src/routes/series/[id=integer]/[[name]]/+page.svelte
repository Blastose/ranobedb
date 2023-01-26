<script lang="ts">
	import Box from '$lib/components/box/Box.svelte';
	import BookView from '$lib/components/book/BookView.svelte';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
	let bookCover = data.books[0]?.cover_image_file_name;
</script>

<svelte:head>
	<title>{data.series.title} - RanobeDB</title>
</svelte:head>

<main class="series-container">
	<div
		class="highlight bg"
		class:bg-image={bookCover}
		style={bookCover
			? `background-image: linear-gradient(rgba(27, 27, 27, 0.2), rgba(33, 34, 36, 0.9)), url(${PUBLIC_IMAGE_URL}/${bookCover}.jpg);`
			: ''}
	>
		<div class="blur-image">
			<div class="main-container">
				<p class="text-xl sm:text-3xl font-bold">{data.series.title}</p>
				<p class="text-lg sm:text-xl font-semibold">{data.series.title_romaji ?? ''}</p>
				<p class="text-sm sm:text-base font-semibold">Series</p>
			</div>
		</div>
	</div>

	<div class="main-container content">
		<div>
			<p class="font-bold">About</p>
			<p>Publication Status: Unknown</p>
			<p>Latest Volume Release Date: {data.books[data.books.length - 1]?.release_date ?? 'N/A'}</p>
		</div>

		<div class="w-min">
			<Box text={'Edit'} href={`/series/${$page.params.id}/edit`} icon={'pencil'} preload={false} />
		</div>

		<div>
			<p class="font-bold">Books in series</p>
			<BookView books={data.books} />
		</div>
	</div>
</main>

<style>
	.series-container {
		display: grid;
		grid-template-areas:
			'highlight'
			'content';
		grid-template-rows: 10rem 1fr;
	}

	.bg-image {
		overflow: hidden;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 20% 20%;
	}

	.blur-image {
		height: 100%;
		width: 100%;
		backdrop-filter: blur(10px);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		color: white;
	}

	.highlight:not(.bg-image) {
		background: linear-gradient(var(--primary-500), #2b2c3d);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
