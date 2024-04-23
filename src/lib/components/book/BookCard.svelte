<script lang="ts">
	import type { Book } from '$lib/server/db/books/books';
	import type { Language } from '$lib/db/dbTypes';
	import { formatDate } from './book';

	export let book: Book;

	const prio: { lang: Language; romaji: boolean }[] = [
		{ lang: 'en', romaji: false },
		{ lang: 'ja', romaji: true },
	];

	function getFirstLang(languages: (typeof book)['titles']) {
		for (const pri of prio) {
			for (const lang of languages) {
				if (lang.lang == pri.lang) {
					if (pri.romaji) {
						return lang.romaji ?? lang.title;
					} else {
						return lang.title;
					}
				}
			}
		}
		return languages.at(0)?.title ?? '';
	}

	$: displayedTitle = prio.find((p) => p.lang === 'ja')?.romaji
		? book.romaji ?? book.title
		: book.title;
</script>

<div class="bg-[var(--bg-light1)] dark:bg-[var(--bg-dark1)] p-2 rounded-sm shadow-sm">
	<div class="title-container">
		{#if book.filename}
			<img
				width="240"
				height="360"
				class="img rounded-sm shadow-sm"
				src="/covers_temp/{book.filename}.jpg"
				alt=""
			/>
		{:else}
			<div />
		{/if}
		<h4 class="flex flex-col gap-2">
			<a class="line-clamp-2 font-bold text-lg" href="/book/{book.id}">{book.title}</a>

			{#if book.date}
				<p>{formatDate(book.date)}</p>
			{/if}

			<p class="line-clamp-4 whitespace-pre-wrap">
				{book.description_ja ?? ''}
			</p>
		</h4>
	</div>
</div>

<style>
	.title-container {
		display: grid;
		grid-template-columns: 100px 1fr;
		gap: 0.75rem;
	}
</style>
