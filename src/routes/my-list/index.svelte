<script lang="ts">
	import BookCardContainer from '$lib/book/BookCardContainer.svelte';
	import type BookInfo from '$lib/models/bookInfo';
	import Label from '$lib/reading-labels/Label.svelte';

	let queryName = 'label-name';
	export let books: BookInfo[];
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
	<BookCardContainer {books} />
</div>
