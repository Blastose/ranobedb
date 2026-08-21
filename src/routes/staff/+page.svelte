<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import DisplayBoxContainer from '$lib/components/layout/db/DisplayBoxContainer.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
	import LangNameDisplay from '$lib/components/display/LangNameDisplay.svelte';
	import StaffBrowseFilters from '$lib/components/form/filters/staff/StaffBrowseFilters.svelte';

	let { data } = $props();
</script>

<PageTitle title="Staff" />

<DbShell
	name="staff"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by staff name"
>
	{#snippet filters()}
		<StaffBrowseFilters filtersForm={data.filtersFormObj} />
	{/snippet}

	{#snippet display()}
		<DisplayBoxContainer>
			{#each data.staff as staff (staff.id)}
				<LinkBox href="/staff/{staff.id}">
					<LangNameDisplay lang={staff.lang} obj={staff} />
				</LinkBox>
			{/each}
		</DisplayBoxContainer>
	{/snippet}
</DbShell>
