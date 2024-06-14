<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import type { Language } from '$lib/server/db/dbTypes';
	import type { Nullish } from '$lib/server/zod/schema';
	import TitleDisplay from '../display/TitleDisplay.svelte';

	export let book: {
		title: string;
		title_orig?: string | null;
		romaji?: string | null;
		romaji_orig?: string | null;
		lang?: Language;
		id: number;
		image: Nullish<{
			width: number;
			height: number;
			filename: string;
		}>;
	};
	export let urlPrefix: string;
</script>

<a href="{urlPrefix}{book.id}" class="flex flex-col gap-1">
	<div class="overflow-hidden rounded-md relative">
		{#if book?.image}
			<img
				width={book?.image?.width}
				height={book?.image?.height}
				src="{PUBLIC_IMAGE_URL}{book?.image?.filename}"
				alt=""
				class="rounded-md object-cover"
				style="aspect-ratio: 0.70381231671554252199413489736072;"
				loading="lazy"
			/>
		{:else}
			<div
				class="bg-neutral-500 w-full h-full"
				style="aspect-ratio: 0.70381231671554252199413489736072;"
			>
				<p class="p-4">No cover</p>
			</div>
		{/if}
		<slot />
	</div>
	<p class="line-clamp-2 text-sm sm:text-base">
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
