<script lang="ts">
	import BookCard from '$lib/components/book/BookCard.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DBShell from '$lib/components/layout/db/DBShell.svelte';
	import BookFilters from '$lib/components/form/book/filters/BookFilters.svelte';

	export let data;
</script>

<PageTitle title="Books" />

<DBShell
	name="books"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by book title"
>
	<svelte:fragment slot="filters">
		<BookFilters filtersForm={data.filtersForm} />
	</svelte:fragment>

	<svelte:fragment slot="display">
		<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
			{#each data.books as book (book.id)}
				<BookCard {book} />
			{/each}
		</div>
	</svelte:fragment>
</DBShell>
