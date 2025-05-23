<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DBShell from '$lib/components/layout/db/DBShell.svelte';
	import BookFilters from '$lib/components/form/book/filters/BookFilters.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import BookImage from '$lib/components/book/BookImage.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';

	let { data } = $props();
</script>

<PageTitle title="Books" />

<DBShell
	name="books"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by book title"
>
	{#snippet filters()}
		<BookFilters
			filtersForm={data.filtersFormObj}
			isUser={Boolean(data.user)}
			isList={false}
			allCustLabels={data.allCustLabels}
		/>
	{/snippet}

	{#snippet display()}
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
				>
					{#if book.label}
						<BookImageBadge badges={[book.label.label]} location="top-right" />
					{/if}
				</BookImage>
			{/each}
		</BookImageContainer>
	{/snippet}
</DBShell>
