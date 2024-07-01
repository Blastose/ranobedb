<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import DisplayBoxContainer from '$lib/components/layout/db/DisplayBoxContainer.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';

	export let data;
</script>

<PageTitle title="Publishers" />

<DbShell
	name="publishers"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by publisher name"
>
	<svelte:fragment slot="display">
		<DisplayBoxContainer>
			{#each data.publishers as publisher (publisher.id)}
				<LinkBox href="/publisher/{publisher.id}"><NameDisplay obj={publisher} /></LinkBox>
			{/each}
		</DisplayBoxContainer>
	</svelte:fragment>
</DbShell>
