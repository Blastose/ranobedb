<script lang="ts">
	import type { PageData } from './$types';
	import BookView from '$lib/components/book/BookView.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Books - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-2">
		<p class="font-bold text-2xl">Books</p>

		<BookView books={data.books} extended={false} />
	</div>
</main>
