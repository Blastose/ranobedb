<script lang="ts">
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DisplayBoxContainer from '$lib/components/layout/db/DisplayBoxContainer.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
	import ListTabs from '$lib/components/layout/list/ListTabs.svelte';

	let { data } = $props();

	let pageTitle = $derived(
		data.isMyList ? 'My followed staff' : `${data.listUser.username}'s followed staff`,
	);
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<PageTitle title={pageTitle} />
<NoIndex />

<DbShell
	name={pageTitle}
	customName={true}
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by staff name"
>
	{#snippet underHeading()}
		<ListTabs userIdNum={data.listUser.id_numeric} listCounts={data.listCounts} />
	{/snippet}

	{#snippet display()}
		<DisplayBoxContainer>
			{#each data.staff as staff (staff.id)}
				<LinkBox href="/staff/{staff.id}"><NameDisplay obj={staff} /></LinkBox>
			{/each}
		</DisplayBoxContainer>
	{/snippet}
</DbShell>
