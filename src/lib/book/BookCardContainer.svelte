<script lang="ts">
	import type Book from '$lib/models/book';
	import BookCard from '$lib/book/BookCard.svelte';

	export let books: Book[];
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
	{#each books as book (book.id)}
		<BookCard {book} />
	{/each}
</div>
