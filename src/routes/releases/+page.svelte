<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';

	export let data;
</script>

<PageTitle title="Releases" />

<DbShell
	name="releases"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by release title"
>
	<svelte:fragment slot="display">
		<div class="flex flex-col gap-4">
			{#each data.releases as release (release.id)}
				<LinkBox href="/release/{release.id}"><NameDisplay obj={release} /></LinkBox>
			{/each}
		</div>
	</svelte:fragment>
</DbShell>
