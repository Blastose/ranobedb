<script lang="ts">
	import BookView from '$lib/book/BookView.svelte';
	import type BookInfo from '$lib/models/bookInfo';
	import Label from '$lib/reading-labels/Label.svelte';

	let queryName = 'label-name';
	export let books: BookInfo[];
</script>

<svelte:head><title>My List - RanobeDB</title></svelte:head>

<main class="container mx-auto px-8 pt-4 pb-8 duration-150">
	<div class="flex flex-col gap-2">
		<div class="flex flex-wrap gap-2">
			<Label name="All" {queryName} queryValue="" />
			<Label name="Reading" {queryName} queryValue="Reading" />
			<Label name="Plan to read" {queryName} queryValue="Plan to read" />
			<Label name="Finished" {queryName} queryValue="Finished" />
		</div>

		<BookView {books} />
	</div>
</main>
