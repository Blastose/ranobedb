<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import BookCardSimple from '$lib/components/book/book-card/BookCardSimple.svelte';

	export let books: BookInfo[];
</script>

<div class="book-simple-container">
	{#each books as book, i (book.id)}
		<!-- Hide cards over a certain count on smaller screens with css -->
		<div class="{i < 4 ? 'zero' : ''}{i >= 4 && i < 8 ? 'four' : ''}{i >= 8 ? 'eight' : ''}">
			<BookCardSimple {book} />
		</div>
	{/each}
</div>

<style>
	.book-simple-container {
		column-count: 1;
	}

	.eight {
		display: none;
	}

	@media (min-width: 640px) {
		.book-simple-container {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			column-count: 2;
		}

		.four {
			display: block;
		}

		.eight {
			display: block;
		}
	}

	@media (min-width: 1536px) {
		.book-simple-container {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			column-count: 4;
		}
	}
</style>
