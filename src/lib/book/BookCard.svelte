<script lang="ts">
	import { supabaseClient } from '$lib/db';
	import type Book from '$lib/models/book';
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

<div
	class="bg-[#e4e7ee] p-2 rounded-sm grid grid-cols-[1fr_75%] md:grid-cols-[150px_1fr] gap-x-2 shadow-sm"
>
	<div class="row-span-2">
		<a href="/book/{book.id}" sveltekit:prefetch>
			<img class="shadow-sm rounded-sm" src={coverUrl} alt="Cover image for {book.title}" />
		</a>
	</div>
	<div class="flex flex-col gap-2">
		<a href="/book/{book.id}" sveltekit:prefetch>
			<span class="font-bold text-xl">{book.title}</span>
		</a>
		<div class="text-sm text-[#263147]">
			{@html book.description}
		</div>
	</div>
</div>
