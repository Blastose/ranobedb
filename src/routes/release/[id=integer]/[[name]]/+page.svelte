<script lang="ts">
	import BookView from '$lib/components/book/BookView.svelte';
	import Box from '$lib/components/box/Box.svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';

	export let data: PageData;
	let bookCover = data.books[0]?.cover_image_file_name;
</script>

<svelte:head>
	<title>{data.release.name} - RanobeDB</title>
</svelte:head>

<main class="release-container">
	<div
		class="highlight bg"
		class:bg-image={bookCover}
		style={bookCover
			? `background-image: linear-gradient(rgba(27, 27, 27, 0.4), rgba(33, 34, 36, 0.9)), url(${PUBLIC_IMAGE_URL}/${bookCover}.jpg);`
			: ''}
	>
		<div class="blur-image">
			<div class="main-container">
				<p class="text-xl sm:text-3xl font-bold">{data.release.name}</p>
				<p class="text-lg sm:text-xl font-semibold">{data.release.name_romaji ?? ''}</p>
				<p class="text-sm sm:text-base font-semibold">Release</p>
			</div>
		</div>
	</div>

	<div class="main-container content">
		<div class="flex flex-col gap-1">
			<p>Description: {data.release.description ?? 'None'}</p>
			<p>Language: {data.release.lang}</p>
			<p>ISBN13: {data.release.isbn13 ?? 'None'}</p>
			<p>Release Date: {data.release.release_date}</p>
			<p>Format: {data.release.format}</p>
			<div>
				<p>Publishers:</p>
				{#each data.release.publishers as publisher}
					<div>
						<a class="link" href="/publisher/{publisher.id}">{publisher.name}</a>
					</div>
				{/each}
			</div>
		</div>

		<div class="w-min">
			<Box
				text={'Edit'}
				href={`/release/${$page.params.id}/edit`}
				icon={'pencil'}
				preload={false}
			/>
		</div>

		<div>
			<p class="font-bold">Books that this release belongs to</p>
			<BookView books={data.books} />
		</div>
	</div>
</main>

<style>
	.release-container {
		display: grid;
		grid-template-areas:
			'highlight'
			'content';
		grid-template-rows: min-content 1fr;
	}

	.bg {
		min-height: 10rem;
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
