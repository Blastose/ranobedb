<script lang="ts">
	import type BookInfo from '$lib/models/bookInfo';
	import BookCard from '$lib/book/BookCard.svelte';
	import { supabaseClient } from '$lib/db';

	export let books: BookInfo[];

	const getCover = (book: BookInfo) => {
		let { publicURL } = supabaseClient.storage
			.from('covers')
			.getPublicUrl(`${book.cover_image_file_name}.jpg`);

		return publicURL;
	};
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
	{#each books as book (book.id)}
		<BookCard {book} coverUrl={getCover(book)} />
	{/each}
</div>
