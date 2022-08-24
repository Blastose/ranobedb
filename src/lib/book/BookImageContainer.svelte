<script lang="ts">
	import { supabaseClient } from '$lib/db';

	import BookImage from './BookImage.svelte';

	export let books: { id: number; title: string; cover_image_file_name: string }[];

	const getCover = (book: { cover_image_file_name: string }) => {
		let { publicURL } = supabaseClient.storage
			.from('covers')
			.getPublicUrl(`${book.cover_image_file_name}.jpg`);

		return publicURL;
	};
</script>

<div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
	{#each books as book (book.id)}
		<BookImage {book} coverUrl={getCover(book)} />
	{/each}
</div>
