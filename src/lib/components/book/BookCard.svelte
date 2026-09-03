<script lang="ts">
	import type { Book } from '$lib/server/db/books/books';
	import TitleDisplay from '../display/TitleDisplay.svelte';
	import Cover from '$lib/components/image/Cover.svelte';

	interface Props {
		book: Book;
	}

	let { book }: Props = $props();
</script>

<div class="rounded-lg bg-[var(--bg-light1)] p-2 shadow-sm dark:bg-[var(--bg-dark1)]">
	<div class="title-container">
		{#if book.image}
			<a href="/book/{book.id}">
				<Cover image={book.image} useDefaultCoverAspectRatio={true} />
			</a>
		{:else}
			<div></div>
		{/if}
		<h4 class="flex flex-col gap-2">
			<a class="line-clamp-2 text-lg font-bold" href="/book/{book.id}"
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
