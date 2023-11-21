<script lang="ts">
	import BookCard from '$lib/components/book/BookCard.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';

	export let data;
</script>

<PageTitle title="Books" />

<DbShell
	name="books"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
>
	<svelte:fragment slot="display">
		<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
			{#each data.books as book (book.id)}
				<BookCard {book} />
			{/each}
		</div>
	</svelte:fragment>
</DbShell>
