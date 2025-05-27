<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';
	import SeriesFilters from '$lib/components/form/series/filters/SeriesFilters.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';

	let { data } = $props();
</script>

<PageTitle title="Series" />

<DbShell
	name="series"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by series title"
>
	{#snippet filters()}
		<SeriesFilters
			filtersForm={data.filtersFormObj}
			genres={data.genres}
			isUser={Boolean(data.user)}
			isList={false}
			allCustLabels={data.allCustLabels}
		/>
	{/snippet}

	{#snippet display()}
		<BookImageContainer moreColumns={true}>
			{#each data.series as series (series.id)}
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
						{#if series.label}
							<BookImageBadge badges={[series.label.label]} location="top-right" />
						{/if}
						{#if series.volumes}
							<BookImageBadge badges={[`${series.volumes.count} vols.`]} location="bottom-right" />
						{/if}
					</BookImage>
				{:else}
					<LinkBox display={series.title ?? ''} href="/series/{series.id}" />
				{/if}
			{/each}
		</BookImageContainer>
	{/snippet}
</DbShell>
