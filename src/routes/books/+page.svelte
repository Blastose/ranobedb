<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DBShell from '$lib/components/layout/db/DBShell.svelte';
	import BookFilters from '$lib/components/form/book/filters/BookFilters.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import BookImage from '$lib/components/book/BookImage.svelte';

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
		<BookImageContainer moreColumns={true}>
			{#each data.books as book (book.id)}
				<BookImage
					book={{
						title: book.title,
						romaji: book.romaji,
						id: book.id,
						image: book.image,
						lang: book.lang,
						romaji_orig: book.romaji_orig,
						title_orig: book.title_orig,
					}}
					urlPrefix="/book/"
				></BookImage>
			{/each}
		</BookImageContainer>
	</svelte:fragment>
</DBShell>
