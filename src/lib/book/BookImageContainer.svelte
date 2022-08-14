<script lang="ts">
	import type BookInfo from '$lib/models/bookInfo';
	import BookImage from './BookImage.svelte';

	export let books: BookInfo[];
</script>

<div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
	{#each books as book (book.id)}
		<BookImage {book} />
	{/each}
</div>
