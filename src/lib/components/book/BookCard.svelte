<script lang="ts">
	import type { Book } from '$lib/server/db/books/books';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import TitleDisplay from '../display/TitleDisplay.svelte';
	import { getDisplayPrefsContext } from '$lib/display/prefs';

	interface Props {
		book: Book;
	}

	let { book }: Props = $props();

	const displayPrefs = getDisplayPrefsContext();
</script>

<div class="bg-[var(--bg-light1)] dark:bg-[var(--bg-dark1)] p-2 rounded-lg shadow-sm">
	<div class="title-container">
		{#if book.image}
			<a href="/book/{book.id}">
				<img
					width={book.image.width}
					height={book.image.height}
					class="img rounded-md shadow-sm"
					src="{PUBLIC_IMAGE_URL}{book.image.filename}"
					alt=""
					loading="lazy"
				/>
			</a>
		{:else}
			<div></div>
		{/if}
		<h4 class="flex flex-col gap-2">
			<a class="line-clamp-2 font-bold text-lg" href="/book/{book.id}"
				><TitleDisplay obj={book} /></a
			>

			<!-- <p class="line-clamp-4 whitespace-pre-wrap">
				{#if $displayPrefs.descriptions === 'en'}
					{book.description || book.description_ja}
				{:else}
					{book.description_ja || book.description}
				{/if}
			</p> -->
		</h4>
	</div>
</div>

<style>
	.title-container {
		display: grid;
		grid-template-columns: 72px 1fr;
		gap: 0.75rem;
	}

	@media (min-width: 640px) {
		.title-container {
			grid-template-columns: 96px 1fr;
		}
	}
</style>
