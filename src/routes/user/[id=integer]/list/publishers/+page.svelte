<script lang="ts">
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DisplayBoxContainer from '$lib/components/layout/db/DisplayBoxContainer.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
	import ListTabs from '$lib/components/layout/list/ListTabs.svelte';
	import LangNameDisplay from '$lib/components/display/LangNameDisplay.svelte';
	import PublishersFilters from '$lib/components/form/filters/publisher/PublishersFilters.svelte';

	let { data } = $props();

	let pageTitle = $derived(
		data.isMyList ? 'My favorited publishers' : `${data.listUser.username}'s favorited publishers`,
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
	inputPlaceholder="Search by publisher name"
>
	{#snippet underHeading()}
		<ListTabs userIdNum={data.listUser.id_numeric} listCounts={data.listCounts} />
	{/snippet}

	{#snippet filters()}
		<PublishersFilters filtersForm={data.filtersFormObj} />
	{/snippet}

	{#snippet display()}
		<DisplayBoxContainer>
			{#each data.publishers as publisher (publisher.id)}
				<LinkBox href="/publisher/{publisher.id}">
					<LangNameDisplay lang={publisher.lang} obj={publisher} />
				</LinkBox>
			{/each}
		</DisplayBoxContainer>
	{/snippet}
</DbShell>
