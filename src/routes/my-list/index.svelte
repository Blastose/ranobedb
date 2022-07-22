<script lang="ts">
	import BookCard from '$lib/book/BookCard.svelte';
	import type Book from '$lib/models/book';
	import Label from '$lib/reading-labels/Label.svelte';

	let queryName = 'label-name';
	export let books: Book[];
</script>

<svelte:head><title>My List - Light Novel DB</title></svelte:head>

<div class="flex flex-col gap-2">
	<div class="flex flex-wrap gap-2">
		<Label name="All" {queryName} queryValue="" />
		<Label name="Reading" {queryName} queryValue="Reading" />
		<Label name="Plan to read" {queryName} queryValue="Plan to read" />
		<Label name="Finished" {queryName} queryValue="Finished" />
	</div>

	<p>{books.length} books</p>
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
		{#each books as book (book.id)}
			<BookCard {book} />
		{/each}
	</div>
</div>
