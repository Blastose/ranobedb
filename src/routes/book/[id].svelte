<script lang="ts">
	import type BookInfo from '$lib/models/bookInfo';
	import { session } from '$app/stores';
	import { bind } from 'svelte-simple-modal';
	import { modal } from '$lib/stores/modalStore';
	import AddBookModal from '$lib/add-book-modal/AddBookModal.svelte';
	import PersonBox from '$lib/book/PersonBox.svelte';
	import ReleaseTable from '$lib/release/ReleaseTable.svelte';
	import type Release from '$lib/models/release';
	import BookImageContainer from '$lib/book/BookImageContainer.svelte';

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
	<title>{book.title} - Light Novel DB</title>
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

	<div class="container mx-auto px-8 py-4 duration-150">
		<div class="flex flex-col gap-6">
			<div class="flex flex-col md:flex-row gap-4">
				<img
					src={image}
					alt="Cover image for {book.title}"
					class="h-fit shadow-md rounded-sm"
					width="240"
					height="340"
				/>

				<div class="flex flex-col gap-4 py-4">
					{#if $session.user}
						<button
							on:click={showModal}
							class="w-fit rounded-md bg-slate-500 hover:bg-slate-600 text-lg px-12 py-2 text-white"
						>
							{#if readingStatus}
								{readingStatus}
							{:else}
								Add
							{/if}
						</button>
					{/if}

					<div class="flex gap-2">
						{#each book.authors as author (author.id)}
							<PersonBox person={author} type="author" />
						{/each}
						{#each book.artists as artist (artist.id)}
							<PersonBox person={artist} type="artist" />
						{/each}
					</div>

					<p>{@html book.description}</p>
				</div>
			</div>

			<!-- <div class="flex flex-col gap-2">
				<span class="font-bold">Releases:</span>
				<ReleaseTable {releases} />
			</div> -->

			{#if seriesBooks.length > 1}
				<div class="flex flex-col gap-2">
					<span class="font-bold">Other books in the same series:</span>
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
</style>
