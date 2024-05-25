<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import type { Language } from '$lib/server/db/dbTypes';
	import TitleDisplay from '../display/TitleDisplay.svelte';

	export let book: {
		title: string;
		title_orig?: string;
		romaji?: string | null;
		romaji_orig?: string | null;
		lang?: Language;
		id: number;
		image: {
			width: number;
			height: number;
			filename: string;
		} | null;
	};
	export let urlPrefix: string;
</script>

<a href="{urlPrefix}{book.id}" class="flex flex-col gap-1">
	<div class="overflow-hidden rounded-md">
		<img
			width={book?.image?.width}
			height={book?.image?.height}
			src="{PUBLIC_IMAGE_URL}{book?.image?.filename}"
			alt=""
			class="duration-150 rounded-md object-cover hover:scale-[1.01]"
			style="aspect-ratio: 0.70381231671554252199413489736072;"
			loading="lazy"
		/>
	</div>
	<p class="line-clamp-2">
		<TitleDisplay
			obj={{
				lang: book.lang ?? 'en',
				romaji: book.romaji ?? null,
				romaji_orig: book.romaji_orig ?? null,
				title: book.title,
				title_orig: book.title_orig ?? '',
			}}
			fallback={book.title}
		/>
	</p>
</a>
