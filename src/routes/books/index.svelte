<script lang="ts">
	import BookCardContainer from '$lib/book/BookCardContainer.svelte';
	import type Book from '$lib/models/book';

	export let books: Book[];
</script>

<svelte:head><title>Books - Light Novel DB</title></svelte:head>

<div class="flex flex-col gap-2">
	<p>{books.length} books</p>
	<BookCardContainer {books} />
</div>
