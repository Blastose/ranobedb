<script lang="ts">
	import BookCard from '$lib/components/book/BookCard.svelte';
	import type { BookInfo } from '$lib/types/dbTypes';

	export let books: BookInfo[];
</script>

<div class="book-card-container">
	{#each books as book}
		<BookCard {book} />
	{/each}
</div>

<style>
	.book-card-container {
		display: grid;
		row-gap: 0.375rem;
		column-gap: 0.5rem;
		grid-template-columns: repeat(1, minmax(0, 1fr));
	}

	@media (min-width: 1024px) {
		.book-card-container {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
