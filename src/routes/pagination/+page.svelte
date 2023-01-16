<script lang="ts">
	import type { PageData } from './$types';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import BookView from '$lib/components/book/BookView.svelte';
	export let data: PageData;

	const pageSize = 8;
	const totalPages = Math.ceil(Number(data.count) / pageSize);
</script>

<svelte:head><title>Pagination Test - RanobeDB</title></svelte:head>

<div class="main-container">
	<p class="font-bold text-lg">{data.count} total books</p>
	<div class="flex flex-col gap-4">
		<BookView books={data.books} />
		<Pagination {totalPages} />
	</div>
</div>

<style>
</style>
