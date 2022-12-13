<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import BookCardSimple from '$lib/components/book/BookCardSimple.svelte';

	export let books: BookInfo[];
	books = books.slice(0, 16);
</script>

<div class="book-simple-container">
	{#each books as book (book.id)}
		<BookCardSimple {book} />
	{/each}
</div>

<style>
	.book-simple-container {
		column-count: 1;
	}

	@media (min-width: 640px) {
		.book-simple-container {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			column-count: 2;
		}
	}

	@media (min-width: 1536px) {
		.book-simple-container {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			column-count: 4;
		}
	}
</style>
