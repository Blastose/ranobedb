<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import type Book from '$lib/models/book';
	import { onMount } from 'svelte';

	export let book: Book;

	let coverUrl: string | null;
	const getCover = () => {
		let { publicURL, error } = supabase.storage
			.from('cover-images')
			.getPublicUrl(`${book.cover_image_file_name}.jpg`);

		coverUrl = publicURL;
	};

	onMount(getCover);
</script>

<div class="bg-[#e4e7ee] p-2 rounded-sm grid grid-cols-[150px_1fr] gap-x-2">
	<div class="row-span-2">
		<a href="/book/{book.id}">
			<img class="shadow-sm" src={coverUrl} alt="Cover image for {book.title}" />
		</a>
	</div>
	<div class="grid grid-rows-[min_1fr] gap-2">
		<a href="/book/{book.id}">
			<span class="font-bold text-xl">{book.title}</span>
		</a>
		<div class="text-sm">
			{@html book.description}
		</div>
	</div>
</div>
