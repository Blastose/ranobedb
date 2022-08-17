<script lang="ts">
	import { supabaseClient } from '$lib/db';
	import type BookInfo from '$lib/models/bookInfo';
	import { onMount } from 'svelte';

	export let book: BookInfo;

	let coverUrl: string | null;
	const getCover = () => {
		let { publicURL } = supabaseClient.storage
			.from('cover-images')
			.getPublicUrl(`${book.cover_image_file_name}.jpg`);

		coverUrl = publicURL;
	};

	onMount(getCover);
</script>

<div>
	<a class="h-min" href="/book/{book.id}" sveltekit:prefetch>
		<div class="flex flex-col gap-1">
			<img
				loading="lazy"
				class="shadow-sm rounded-sm"
				src={coverUrl}
				alt="Cover image for {book.title}"
			/>
			<span>{book.title}</span>
		</div>
	</a>
</div>
