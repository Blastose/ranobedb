<script lang="ts">
	import type BookInfo from '$lib/models/bookInfo';
	import BookCard from '$lib/book/BookCard.svelte';

	export let books: BookInfo[];
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
	{#each books as book (book.id)}
		<BookCard {book} />
	{/each}
</div>
