<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import DBShell from '$lib/components/layout/db/DBShell.svelte';
	import LabelContainer from '$lib/components/readinglist/LabelContainer.svelte';

	export let data;

	$: pageTitle = data.isMyList ? 'My list' : `${data.listUser.username}'s list`;
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<DBShell
	name={pageTitle}
	customName={true}
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by book title"
>
	<svelte:fragment slot="info">
		<LabelContainer userLabels={data.userLabelCounts} activeLabels={data.labels} />
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
