<script lang="ts">
	import type { PageData } from './$types';
	import BookImageContainer from '$lib/components/book/BookImageContainer.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Books - RanobeDB</title>
</svelte:head>

<main class="main-container">
	<div class="flex flex-col gap-2">
		<p class="font-bold text-2xl dark:text-white">Books</p>
		<BookImageContainer books={data.books} />
	</div>
</main>
