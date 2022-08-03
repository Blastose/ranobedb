<script lang="ts">
	import type Book from '$lib/models/book';
	import { supabaseClient } from '$lib/db';
	import { onMount } from 'svelte';

	export let book: Book;
	let coverUrl: string | null;
	const getCover = () => {
		let { publicURL } = supabaseClient.storage
			.from('cover-images')
			.getPublicUrl(`${book.cover_image_file_name}.jpg`);

		coverUrl = publicURL;
	};

	onMount(getCover);
</script>

<div class="flex flex-col gap-2">
	<span class="font-bold">Add book to reading list</span>
	<div class="flex gap-2">
		<img
			class="shadow-sm rounded-sm"
			src={coverUrl}
			width="150px"
			alt="Cover image for {book.title}"
		/>
		<div class="flex flex-col">
			<span class="flex-grow">{book.title}</span>
			<button class="self-end w-min px-2 py-1 rounded-md text-white bg-slate-500">Add</button>
		</div>
	</div>
</div>
