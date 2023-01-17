<script lang="ts">
	import type { PageData } from './$types';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import BookView from '$lib/components/book/BookView.svelte';

	export let data: PageData;
</script>

<svelte:head><title>Pagination Test - RanobeDB</title></svelte:head>

<div class="main-container">
	<p class="font-bold text-2xl">Books</p>
	<div class="flex flex-col gap-4">
		<BookView books={data.books} numberOfBooks={data.count} />
		<Pagination totalPages={data.totalPages} />
	</div>
</div>

<style>
</style>
