<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import DisplayBoxContainer from '$lib/components/layout/db/DisplayBoxContainer.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';

	export let data;
</script>

<PageTitle title="Tags" />

<DbShell
	name="tags"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by tag name"
>
	<svelte:fragment slot="display">
		<div class="capitalize">
			<DisplayBoxContainer>
				{#each data.tags as tag}
					<LinkBox display="{tag.name} ({tag.count})" href="/series?tagsInclude={tag.id}" />
				{/each}
			</DisplayBoxContainer>
		</div>
	</svelte:fragment>
</DbShell>
