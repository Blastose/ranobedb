<script lang="ts">
	import type { Language } from '$lib/server/db/dbTypes';
	import type { Nullish } from '$lib/server/zod/schema';
	import TitleDisplay from '../display/TitleDisplay.svelte';
	import Cover from '../image/Cover.svelte';

	interface Props {
		book: {
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
		urlPrefix: string;
		children?: import('svelte').Snippet;
	}

	let { book, urlPrefix, children }: Props = $props();
</script>

<a href="{urlPrefix}{book.id}" class="flex flex-col gap-1">
	<Cover obj={book}>
		{@render children?.()}
	</Cover>
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
