<script lang="ts">
	import BookCard from '$lib/components/book/BookCard.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DBShell from '$lib/components/layout/db/DBShell.svelte';
	import LabelContainer from '$lib/components/readinglist/LabelContainer.svelte';

	export let data;

	$: pageTitle = data.isMyList ? 'My list' : `${data.listUser.username}'s list`;
</script>

<PageTitle title={pageTitle} />

<DBShell
	name={pageTitle}
	customName={true}
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by book title"
>
	<svelte:fragment slot="info">
		<LabelContainer userLabels={data.userLabelCounts} />
	</svelte:fragment>

	<svelte:fragment slot="display">
		<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
			{#each data.books as book (book.id)}
				<BookCard {book} />
			{/each}
		</div>
	</svelte:fragment>
</DBShell>
