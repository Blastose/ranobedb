<script lang="ts">
	import type { PageData } from './$types';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import Box from '$lib/components/box/Box.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.book.title} - RanobeDB</title>
</svelte:head>

<main>
	<div
		class="bg-image"
		style="background-image: linear-gradient(rgba(27, 27, 27, 0.1), rgba(33, 34, 36, 0.9)), url({PUBLIC_IMAGE_URL}/{data
			.book.cover_image_file_name}.jpg);"
	>
		<div class="blur-image" />
	</div>
	<div class="book-container">
		<div class="grid-container">
			<img
				class="image shadow-md"
				src="{PUBLIC_IMAGE_URL}/{data.book.cover_image_file_name}.jpg"
				alt=""
				width="240"
				height="340"
			/>
			<button class="add-button"> Add </button>
			<p class="title text-lg sm:text-xl md:text-3xl">
				{data.book.title}
			</p>
			<div class="info">
				<div class="flex flex-wrap gap-2">
					{#each data.book.authors as author}
						<Box text={author.name} href={`/person/${author.id}`} icon={'pencil'} />
					{/each}
					{#each data.book.artists as artist}
						<Box text={artist.name} href={`/person/${artist.id}`} icon={'palette'} />
					{/each}
					{#each data.book.publisher as publisher}
						<Box text={publisher.name} href={`/publisher/${publisher.id}`} icon={'homeCity'} />
					{/each}
				</div>
				<p class="max-w-3xl">
					{@html data.book.description}
				</p>
			</div>
		</div>
	</div>
</main>

<style>
	.bg-image {
		height: 12rem;
		overflow: hidden;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 20% 20%;
	}

	.blur-image {
		height: 100%;
		width: 100%;
		backdrop-filter: blur(8px);
	}

	.image {
		grid-area: img;
		align-self: flex-end;
		border-radius: 0.125rem;
	}

	.add-button {
		grid-area: btn;
		height: min-content;
		margin-top: 0.5rem;
		border-radius: 0.375rem;
		background-color: var(--primary-500);
		color: white;
		padding: 0.5rem;
		width: 100%;
		transition-duration: 150ms;
	}

	.add-button:hover {
		background-color: var(--primary-700);
	}

	.book-container {
		max-width: 1536px;
		padding: 0rem 2rem;
		margin-left: auto;
		margin-right: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.grid-container {
		position: relative;
		display: grid;
		column-gap: 1rem;
		grid-template-columns: 110px 1fr;
		grid-template-rows: 8rem min-content 1fr;
		margin-top: -8rem;
		transition-duration: 150ms;

		grid-template-areas:
			'img title'
			'img btn'
			'info info';
	}

	.info {
		display: flex;
		flex-direction: column;
		grid-area: info;
		gap: 1rem;
		margin-top: 0.75rem;
	}

	.title {
		grid-area: title;
		align-self: flex-end;
		max-width: 56rem;
		margin-bottom: 0.5rem;
		color: white;
		font-weight: bold;
	}

	@media (min-width: 640px) {
		.bg-image {
			height: 14rem;
		}

		.title {
			margin-bottom: 1rem;
		}

		.grid-container {
			grid-template-columns: 170px 1fr;
			grid-template-rows: 8rem min-content 1fr;
			grid-template-areas:
				'img title'
				'img info'
				'btn info';
		}
	}

	@media (min-width: 768px) {
		.bg-image {
			height: 16rem;
		}

		.grid-container {
			grid-template-columns: 220px 1fr;
			grid-template-rows: 8rem min-content 1fr;
		}
	}
</style>
