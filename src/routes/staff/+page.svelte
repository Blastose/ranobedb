<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import DisplayBoxContainer from '$lib/components/layout/db/DisplayBoxContainer.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';

	export let data;
</script>

<PageTitle title="Staff" />

<DbShell
	name="staff"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by staff name"
>
	<svelte:fragment slot="display">
		<DisplayBoxContainer>
			{#each data.staff as staff (staff.id)}
				<LinkBox href="/staff/{staff.id}"><NameDisplay obj={staff} /></LinkBox>
			{/each}
		</DisplayBoxContainer>
	</svelte:fragment>
</DbShell>
