<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DBShell from '$lib/components/layout/db/DBShell.svelte';

	export let data;
</script>

<PageTitle title="Books" />

<!-- TODO make pretty -->
<DBShell
	name="books"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by book title"
>
	<svelte:fragment slot="display">
		<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
			{#each data.books as book (book.id)}
				<div>
					<a href="/book/{book.id}">{book.title}</a>
					<p>Hidden: {book.hidden}</p>
					<p>Locked: {book.locked}</p>
				</div>
			{/each}
		</div>
	</svelte:fragment>
</DBShell>
