<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import BookImageOver from '$lib/components/book/BookImageOver.svelte';

	export let books: BookInfo[];
</script>

<div class="book-image-container">
	{#each books as book (book.id)}
		<BookImageOver {book} />
	{/each}
</div>

<style>
	.book-image-container {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	@media (min-width: 640px) {
		.book-image-container {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
	@media (min-width: 768px) {
		.book-image-container {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}
	@media (min-width: 1280px) {
		.book-image-container {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}
	@media (min-width: 1536px) {
		.book-image-container {
			grid-template-columns: repeat(8, minmax(0, 1fr));
		}
	}
</style>
