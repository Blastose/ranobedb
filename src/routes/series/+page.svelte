<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';

	export let data;
</script>

<PageTitle title="Series" />

<DbShell
	name="series"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by series title"
>
	<svelte:fragment slot="display">
		<div>
			<div class="flex flex-col gap-4">
				{#each data.series as series (series.id)}
					<LinkBox display={series.title ?? ''} href="/series/{series.id}" />
				{/each}
			</div>
		</div>
	</svelte:fragment>
</DbShell>
