<script lang="ts">
	import type Book from '$lib/models/book';
	import { session } from '$app/stores';
	import { bind } from 'svelte-simple-modal';
	import { modal } from '$lib/stores/modalStore';
	import AddBookModal from '$lib/add-book-modal/AddBookModal.svelte';

	export let book: Book;
	export let image: string;
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
		style="background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)),
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
		<img src={image} alt="Cover image for {book.title}" width="240" height="340" />
		<br />
		<h1 class="text-2xl font-bold">{book.title}</h1>
		<br />
		<p>{@html book.description}</p>

		<br />
		{#if $session.user}
			<button
				on:click={showModal}
				class="rounded-md bg-slate-500 hover:bg-slate-600 text-lg px-12 py-2 text-white"
			>
				{#if readingStatus}
					{readingStatus}
				{:else}
					Add
				{/if}
			</button>
		{/if}
	</div>
</main>

<style>
	.bg-image {
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 20% 20%;
	}
</style>
