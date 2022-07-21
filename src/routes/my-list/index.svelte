<script lang="ts">
	import BookCard from '$lib/book/BookCard.svelte';
	import type Book from '$lib/models/book';

	export let books: Book[];
</script>

<svelte:head><title>User List - Light Novel DB</title></svelte:head>

<div class="flex flex-col gap-2">
	<p>{books.length} books</p>
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
		{#each books as book}
			<BookCard {book} />
		{/each}
	</div>
</div>
