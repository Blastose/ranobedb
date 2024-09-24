<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import DBShell from '$lib/components/layout/db/DBShell.svelte';
	import ListTabs from '$lib/components/layout/list/ListTabs.svelte';
	import LabelContainer from '$lib/components/readinglist/LabelContainer.svelte';
	import BookFilters from '$lib/components/form/book/filters/BookFilters.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';

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
	<svelte:fragment slot="filters">
		<BookFilters filtersForm={data.formObj} isUser={true} allCustLabels={data.allCustLabels} isList={true}
		></BookFilters>
	</svelte:fragment>

	<svelte:fragment slot="under-heading"
		><ListTabs userIdNum={data.listUser.id_numeric} listCounts={data.listCounts} /></svelte:fragment
	>

	<svelte:fragment slot="info">
		<div class="flex flex-col gap-1">
			<LabelContainer userLabels={data.userLabelCounts} activeLabels={data.labels} />
			<LabelContainer userLabels={data.userCustLabelCounts} activeLabels={data.labels} />
		</div>
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
				>
					<BookImageBadge badges={[`${book.label?.label}`]} location="top-right" />
				</BookImage>
			{/each}
		</BookImageContainer>
	</svelte:fragment>
</DBShell>
