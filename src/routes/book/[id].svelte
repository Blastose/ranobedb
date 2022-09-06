<script lang="ts">
	import type BookInfo from '$lib/models/bookInfo';
	import { session } from '$app/stores';
	import { bind } from 'svelte-simple-modal';
	import { modal } from '$lib/stores/modalStore';
	import AddBookModal from '$lib/add-book-modal/AddBookModal.svelte';
	import PersonBox from '$lib/book/PersonBox.svelte';
	import type Release from '$lib/models/release';
	import BookImageContainer from '$lib/book/BookImageContainer.svelte';
	import ReleaseCardContainer from '$lib/release/ReleaseCardContainer.svelte';
	import { page } from '$app/stores';
	import Box from '$lib/components/Box.svelte';
	import Icon from '$lib/components/Icon.svelte';

	export let book: BookInfo;
	export let image: string;
	export let seriesBooks: {
		series_id: number;
		series_title: string;
		id: number;
		title: string;
		cover_image_file_name: string;
	}[];
	export let releases: Release[];
	export let readingStatus: string | null;

	const showModal = () => {
		modal.set(
			bind(AddBookModal, {
				book,
				image
			})
		);
	};
</script>

<svelte:head>
	<title>{book.title} - RanobeDB</title>
</svelte:head>

<main>
	<div
		class="bg-image h-24 md:h-48"
		style="background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6)),
	url({image});"
	>
		<div class="backdrop-blur w-full h-full flex flex-col-reverse">
			<span
				class="container mx-auto px-8 py-4 text-white font-bold md:text-4xl overflow-hidden p-4"
			>
				{book.title}
			</span>
		</div>
	</div>

	<div class="container mx-auto px-8 pt-4 pb-8 duration-150">
		<div class="flex flex-col gap-6">
			<div class="book-layout gap-4">
				<img
					src={image}
					alt="Cover image for {book.title}"
					class="h-fit shadow-md rounded-sm cover"
					width="240"
					height="340"
				/>

				<div class="flex flex-col gap-2 md:gap-2 info">
					{#if $session.user}
						<button
							on:click={showModal}
							class="duration-150 md:w-64 text-center rounded-md bg-primary-500 hover:bg-primary-800 text-lg px-2 py-2 text-white shadow-sm"
						>
							{#if readingStatus}
								{readingStatus}
							{:else}
								Add
							{/if}
						</button>
					{:else}
						<a
							href="/login?redirect={$page.url.pathname}"
							class="duration-150 md:w-64 text-center rounded-md bg-primary-500 hover:bg-primary-800 text-lg px-2 py-2 text-white shadow-sm"
							>Add</a
						>
					{/if}

					<div class="flex flex-wrap gap-2">
						{#each book.authors as author (author.id)}
							<PersonBox person={author} type="author" />
						{/each}
						{#each book.artists as artist (artist.id)}
							<PersonBox person={artist} type="artist" />
						{/each}
					</div>

					<div class="flex flex-wrap gap-2">
						{#each book.publisher as pub}
							<Box text={pub} title="Publisher">
								<Icon height="20" width="20" name="homeCity" />
							</Box>
						{/each}
					</div>

					<div class="flex flex-wrap gap-2">
						<Box text={book.release_date} title="Release date">
							<Icon height="20" width="20" name="calendarRange" />
						</Box>
						<Box text={book.volume} title="Volume">
							<Icon height="20" width="20" name="bookOpenPage" />
						</Box>
					</div>
				</div>

				<div class="flex flex-col gap-2 description">
					<span class="font-bold dark:text-white">Description:</span>
					<p class="max-w-3xl dark:text-white">{@html book.description}</p>
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<span class="font-bold dark:text-white">Releases:</span>
				<ReleaseCardContainer {releases} />
			</div>

			{#if seriesBooks.length > 1}
				<div class="flex flex-col gap-2">
					<span class="font-bold dark:text-white">Other books in the same series:</span>
					<BookImageContainer books={seriesBooks} />
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	.bg-image {
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 20% 20%;
	}

	.book-layout {
		display: grid;
		grid-template-areas:
			'cover info'
			'description description';
		grid-template-columns: 33% 1fr;
	}

	.cover {
		grid-area: cover;
	}

	.info {
		grid-area: info;
	}

	.description {
		grid-area: description;
	}

	@media (min-width: 768px) {
		.book-layout {
			grid-template-areas:
				'cover info'
				'cover description';
			grid-template-columns: 240px 1fr;
		}
	}
</style>
