<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';
	import ListFilters from '$lib/components/form/book/ListFilters.svelte';
	import SeriesFilters from '$lib/components/form/series/filters/SeriesFilters.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
	import ListTabs from '$lib/components/layout/list/ListTabs.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import LabelContainer from '$lib/components/readinglist/LabelContainer.svelte';

	let { data } = $props();

	let pageTitle = $derived(
		data.isMyList ? 'My series list' : `${data.listUser.username}'s series list`,
	);
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<DbShell
	name={pageTitle}
	customName={true}
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by series title"
>
	{#snippet filters()}
		<SeriesFilters
			filtersForm={data.filtersFormObj}
			genres={data.genres}
			isList={true}
			isUser={true}
			allCustLabels={data.allCustLabels}
		></SeriesFilters>
	{/snippet}

	{#snippet underHeading()}
		<ListTabs userIdNum={data.listUser.id_numeric} listCounts={data.listCounts} />
	{/snippet}

	{#snippet info()}
		{#if data.isMyList}
			<ListFilters searchParams={data.urlSearchForm} filter_type="series" />
		{/if}

		<div class="flex flex-col gap-1">
			<LabelContainer userLabels={data.userLabelCounts} activeLabels={data.labels} />
			<LabelContainer userLabels={data.userCustLabelCounts} activeLabels={data.labels} />
		</div>
	{/snippet}

	{#snippet display()}
		<BookImageContainer moreColumns={true}>
			{#each data.user_list_series as series (series.id)}
				{@const volumes_read = series.vols_read?.volumes_read ?? series.c_vols_read?.count}
				{#if series.book}
					<BookImage
						book={{
							title: series.title,
							romaji: series.romaji,
							id: series.id,
							image: series.book.image,
							lang: series.lang,
							romaji_orig: series.romaji_orig,
							title_orig: series.title_orig,
						}}
						urlPrefix="/series/"
					>
						<BookImageBadge
							badges={[`${series.label?.label}`, series.score ? `Score: ${series.score}` : '']}
							location="top-right"
						/>

						<BookImageBadge
							badges={[
								volumes_read
									? `${series.vols_read?.volumes_read ?? (series.c_vols_read?.count || '?')} / ${series.c_num_books} vols.`
									: `${series.c_num_books} vols.`,
							]}
							location="bottom-right"
						/>
					</BookImage>
				{:else}
					<LinkBox display={series.title ?? ''} href="/series/{series.id}" />
				{/if}
			{/each}
		</BookImageContainer>
	{/snippet}
</DbShell>
