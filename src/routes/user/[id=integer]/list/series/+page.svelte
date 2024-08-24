<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';
	import Keyed from '$lib/components/form/Keyed.svelte';
	import MultiSelectField from '$lib/components/form/MultiSelectField.svelte';
	import SeriesFilters from '$lib/components/form/series/filters/SeriesFilters.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
	import ListTabs from '$lib/components/layout/list/ListTabs.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import LabelContainer from '$lib/components/readinglist/LabelContainer.svelte';

	export let data;

	$: pageTitle = data.isMyList ? 'My series list' : `${data.listUser.username}'s series list`;
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
	<svelte:fragment slot="filters">
		<SeriesFilters filtersForm={data.filtersFormObj} genres={data.genres} let:sForm>
			<svelte:fragment>
				<div class="max-w-xs">
					<MultiSelectField
						form={sForm}
						field="l"
						allSelectedText={'All'}
						labelText="Labels"
						dropdownOptions={data.allCustLabels.map((v) => ({
							display: v.label,
							value: v.id,
						}))}
					/>
				</div>
			</svelte:fragment>
		</SeriesFilters>
	</svelte:fragment>

	<svelte:fragment slot="under-heading"
		><ListTabs userIdNum={data.listUser.id_numeric} listCounts={data.listCounts} />
	</svelte:fragment>

	<svelte:fragment slot="info">
		<div class="flex flex-col gap-1">
			<LabelContainer userLabels={data.userLabelCounts} activeLabels={data.labels} />
			<LabelContainer userLabels={data.userCustLabelCounts} activeLabels={data.labels} />
		</div>
	</svelte:fragment>

	<svelte:fragment slot="display">
		<BookImageContainer moreColumns={true}>
			{#each data.user_list_series as series (series.id)}
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
						{#if series.volumes}
							<BookImageBadge badges={[`${series.volumes.count} vols.`]} location="bottom-right" />
						{/if}
					</BookImage>
				{:else}
					<LinkBox display={series.title ?? ''} href="/series/{series.id}" />
				{/if}
			{/each}
		</BookImageContainer>
	</svelte:fragment>
</DbShell>
