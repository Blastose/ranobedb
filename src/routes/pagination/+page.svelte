<script lang="ts">
	import type { PageData } from './$types';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import BookView from '$lib/components/book/BookView.svelte';
	export let data: PageData;

	const pageSize = 5;
	const totalPages = Math.ceil(Number(data.count) / pageSize);
</script>

<div class="main-container">
	<p class="font-bold text-lg">{data.count} total books</p>
	<div>
		<BookView books={data.books} />
	</div>

	<Pagination {totalPages} />
</div>

<style>
</style>
