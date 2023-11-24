<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import DisplayBoxContainer from '$lib/components/layout/db/DisplayBoxContainer.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';

	export let data;
</script>

<PageTitle title="People" />

<DbShell
	name="people"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by person name"
>
	<svelte:fragment slot="display">
		<DisplayBoxContainer>
			{#each data.people as person (person.id)}
				<LinkBox display={person.name} href="/person/{person.id}" />
			{/each}
		</DisplayBoxContainer>
	</svelte:fragment>
</DbShell>
