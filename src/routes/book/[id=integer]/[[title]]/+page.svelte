<script lang="ts">
	import type { PageData } from './$types';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import Box from '$lib/components/box/Box.svelte';
	import ReleaseCard from '$lib/components/release/ReleaseCard.svelte';
	import BookImageContainer from '$lib/components/book/book-image/BookImageContainer.svelte';
	import modalBook from '$lib/stores/modalBook';
	import { createRedirectUrl } from '$lib/util/createRedirectUrl';
	import { page } from '$app/stores';
	import toast from '$lib/stores/toast';

	export let data: PageData;

	const setModalBook = () => {
		modalBook.set({
			book: {
				id: data.book.id,
				title: data.book.title,
				cover_image_file_name: data.book.cover_image_file_name
			},
			startDate: data.readingStatusResult.start_date,
			finishDate: data.readingStatusResult.finish_date,
			status: data.readingStatusResult.label_name
		});
	};
</script>

<svelte:head>
	<title>{data.book.title} - RanobeDB</title>
</svelte:head>

<main class="layout-container">
	<div
		class="bg-image"
		style={data.book.cover_image_file_name
			? `background-image: linear-gradient(rgba(27, 27, 27, 0.1), rgba(33, 34, 36, 0.9)), url(${PUBLIC_IMAGE_URL}/${data.book.cover_image_file_name}.jpg);`
			: 'background: linear-gradient(var(--primary-500), #2b2c3d);'}
	>
		<div class="blur-image">
			<div class="main-container title-container">
				<div />
				<div class="titles">
					<p>
						{data.book.title}
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="main-container grid-container">
		<img
			class="cover-image shadow-md rounded-sm"
			src="{PUBLIC_IMAGE_URL}/{data.book.cover_image_file_name}.jpg"
			alt=""
			width="240"
			height="340"
		/>
		{#if data.user}
			<button
				class="add-button"
				type="button"
				on:click={() => {
					setModalBook();
					toast.set(null);
				}}
			>
				{#if data.readingStatusResult.label_name}
					{data.readingStatusResult.label_name}
				{:else}
					Add
				{/if}
			</button>
		{:else}
			<a class="add-button text-center" href={createRedirectUrl('login', $page.url)}>Add</a>
		{/if}

		<div class="info">
			<div class="flex flex-wrap gap-2">
				{#each data.book.authors as author (author.id)}
					<Box text={author.name} href={`/person/${author.id}`} icon={'pencil'} />
				{/each}
				{#each data.book.artists as artist (artist.id)}
					<Box text={artist.name} href={`/person/${artist.id}`} icon={'palette'} />
				{/each}
				{#each data.book.publisher as publisher (publisher.id)}
					<Box text={publisher.name} href={`/publisher/${publisher.id}`} icon={'homeCity'} />
				{/each}
				<Box text={data.book.release_date ?? 'Unknown'} href={null} icon={'calendarRange'} />
				<Box text={String(data.book.volume)} href={null} icon={'bookOpenPage'} />
				<Box text={'Edit'} href={`/book/${$page.params.id}/edit`} icon={'pencil'} preload={false} />
			</div>
			<div class="max-w-3xl markdown-text">
				{@html data.book.description ?? ''}
			</div>
		</div>
	</div>

	<div class="main-container flex flex-col gap-4">
		{#if data.book.releases.length > 0}
			<div class="flex flex-col gap-2">
				<p class="font-bold">Releases:</p>
				{#each data.book.releases as release (release.id)}
					<ReleaseCard {release} />
				{/each}
			</div>
		{/if}

		<div class="flex flex-col gap-2">
			{#if data.book.same_series.length > 0}
				<p class="font-bold">
					<a href="/series/{data.book.same_series[0]?.series_id}">Other Books in Same Series:</a>
				</p>
				<BookImageContainer books={data.book.same_series} />
			{/if}
		</div>
	</div>
</main>

<style>
	.layout-container {
		display: grid;
		grid-template-areas:
			'highlight'
			'content';
		grid-template-rows: min-content 1fr;
	}

	.bg-image {
		min-height: 8rem;
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

	.title-container {
		display: grid;
		grid-template-areas: 'dummy-image title';
		grid-template-columns: 80px 1fr;
		margin-top: 2rem;
		padding-top: 0rem;
		padding-bottom: 0.2rem;
		column-gap: 0.5rem;
	}

	.titles {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		max-width: 56rem;
	}

	.grid-container {
		padding-top: 0.75rem;
		padding-bottom: 0rem;
		position: relative;
		display: grid;
		column-gap: 0.5rem;
		row-gap: 0.75rem;
		grid-template-columns: 80px 1fr;
		grid-template-rows: min-content 1fr;
		transition-duration: 150ms;

		grid-template-areas:
			'img add-button'
			'info info';
	}

	.info {
		display: flex;
		flex-direction: column;
		grid-area: info;
		gap: 1rem;
	}

	.add-button {
		grid-area: add-button;
		height: min-content;
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

	.cover-image {
		grid-area: img;
		margin-top: -4.5rem;
	}

	.titles > p {
		font-size: 1rem;
		line-height: 1.5rem;
		font-weight: 700;
	}

	@media (min-width: 480px) {
		.titles > p {
			font-size: 1.125rem;
			line-height: 1.75rem;
		}

		.cover-image {
			margin-top: -7.25rem;
		}

		.bg-image {
			min-height: 10rem;
		}

		.title-container {
			grid-template-columns: 110px 1fr;
			column-gap: 1rem;
		}

		.grid-container {
			grid-template-columns: 110px 1fr;
			column-gap: 1rem;
		}
	}

	@media (min-width: 640px) {
		.titles > p {
			font-size: 1.25rem;
			line-height: 1.75rem;
		}

		.title-container {
			padding-bottom: 0.5rem;
		}

		.bg-image {
			min-height: 14rem;
		}

		.cover-image {
			margin-top: -10rem;
		}

		.title-container {
			grid-template-columns: 170px 1fr;
		}

		.grid-container {
			grid-template-columns: 170px 1fr;
			grid-template-areas:
				'img info'
				'add-button info';
		}
	}

	@media (min-width: 768px) {
		.titles > p {
			font-size: 1.875rem;
			line-height: 2.25rem;
		}

		.bg-image {
			min-height: 16rem;
		}

		.title-container {
			grid-template-columns: 190px 1fr;
		}

		.grid-container {
			grid-template-columns: 190px 1fr;
		}
	}

	@media (min-width: 1024px) {
		.titles > p {
			font-size: 1.875rem;
			line-height: 2.25rem;
		}

		.bg-image {
			min-height: 16rem;
		}

		.title-container {
			grid-template-columns: 220px 1fr;
		}

		.grid-container {
			grid-template-columns: 220px 1fr;
		}
	}
</style>
