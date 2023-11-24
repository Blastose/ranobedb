<script lang="ts">
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
				<LinkBox display={release.title} href="/release/{release.id}" />
			{/each}
		</div>
	</svelte:fragment>
</DbShell>
