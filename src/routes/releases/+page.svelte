<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import ReleaseFilters from '$lib/components/form/release/filters/ReleaseFilters.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
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
	<svelte:fragment slot="filters">
		<ReleaseFilters filtersForm={data.filtersForm} />
	</svelte:fragment>

	<svelte:fragment slot="display">
		<div class="flex flex-col gap-4">
			{#each data.releases as release (release.id)}
				<LinkBox href="/release/{release.id}" wrap={true}>
					<div class="flex flex-col gap-2">
						<NameDisplay obj={release} />
						<div class="flex justify-between">
							<p>{new DateNumber(release.release_date).getDateFormatted()}</p>
							<p>
								{release.format}{#if release.pages}
									- {release.pages} pages{/if}
							</p>
						</div>
					</div>
				</LinkBox>
			{/each}
		</div>
	</svelte:fragment>
</DbShell>
