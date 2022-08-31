<script lang="ts">
	import BookView from '$lib/book/BookView.svelte';
	import type BookInfo from '$lib/models/bookInfo';

	export let books: BookInfo[];
</script>

<svelte:head><title>Books - RanobeDB</title></svelte:head>

<main class="container mx-auto px-8 pt-4 pb-8 duration-150">
	<div class="flex flex-col gap-2">
		<div class="flex flex-col">
			<span class="font-bold text-2xl">Books</span>
		</div>
		<div class="flex flex-col gap-2">
			<BookView {books} />
		</div>
	</div>
</main>
