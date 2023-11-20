<script lang="ts">
	import BookCard from '$lib/components/book/BookCard.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Pagination from '$lib/components/pagination/Pagination.svelte';

	export let data;
</script>

<PageTitle title="Books" />

<main class="container-rndb flex flex-col gap-4">
	<div class="asdf">
		<h1 class="font-bold text-4xl">Browse books</h1>

		<div>
			<input type="text" class="input w-full max-w-xl" placeholder="Search" />
		</div>

		<Pagination currentPage={data.currentPage} totalPages={data.totalPages} siblingCount={1} />
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		{#each data.books as book (book.id)}
			<BookCard {book} />
		{/each}
	</div>

	<div>
		<Pagination currentPage={data.currentPage} totalPages={data.totalPages} siblingCount={1} />
	</div>
</main>

<style>
	.asdf {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		view-transition-name: db-head-page;
	}
</style>
