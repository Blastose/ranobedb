<script lang="ts">
	import BookView from '$lib/book/BookView.svelte';
	import type BookInfo from '$lib/models/bookInfo';

	import type Publisher from '$lib/models/publisher';
	export let publisher: Publisher;
	export let books: BookInfo[];
</script>

<svelte:head>
	<title>{publisher.name} - RanobeDB</title>
</svelte:head>

<main class="container mx-auto px-8 pt-4 pb-8 duration-150">
	<div class="flex flex-col gap-2">
		<div class="flex flex-col">
			<span class="font-bold text-2xl dark:text-white">{publisher.name}</span>
			{#if publisher.name_romaji}
				<span class="font-semibold dark:text-white">{publisher.name_romaji}</span>
			{/if}
		</div>
		<div class="flex flex-col gap-2">
			<BookView {books} />
		</div>
	</div>
</main>
