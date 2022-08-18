<script lang="ts">
	import BookView from '$lib/book/BookView.svelte';
	import type BookInfo from '$lib/models/bookInfo';

	export let books: BookInfo[];
</script>

<svelte:head><title>Books - Light Novel DB</title></svelte:head>

<main class="container mx-auto px-8 py-4 duration-150">
	<div class="flex flex-col gap-2">
		<BookView {books} />
	</div>
</main>
