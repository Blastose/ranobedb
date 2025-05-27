<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import ReleaseFilters from '$lib/components/form/release/filters/ReleaseFilters.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';
	import { languageNames } from '$lib/db/dbConsts';

	let { data } = $props();
</script>

<PageTitle title="Releases" />

<DbShell
	name="releases"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by release title"
>
	{#snippet filters()}
		<ReleaseFilters filtersForm={data.filtersFormObj} isUser={Boolean(data.user)} isList={false} />
	{/snippet}

	{#snippet display()}
		<div class="grid grid-cols-1 @sm:grid-cols-2 gap-2">
			{#each data.releases as release (release.id)}
				{@const imageUrl = buildImageUrl(release.image?.filename)}
				<a class="release-wrapper" href="/release/{release.id}">
					<div class="grid grid-cols-[64px_1fr] gap-2 h-full">
						{#if release.image}
							<img
								width={release.image.width}
								height={release.image.height}
								class="rounded-md shadow-sm"
								src={imageUrl}
								alt=""
								loading="lazy"
							/>
						{:else}
							<div></div>
						{/if}
						<div class="flex flex-col justify-between">
							<div>
								<p class="font-bold"><NameDisplay obj={release} /></p>
								<p>{languageNames[release.lang]}</p>
							</div>
							<div class="flex justify-between">
								<p>{new DateNumber(release.release_date).getDateFormatted()}</p>
								<p>
									{release.format}{#if release.pages}
										- {release.pages} pages{/if}
								</p>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/snippet}
</DbShell>

<style>
	.release-wrapper {
		gap: 0.5rem;
		padding: 0.5rem 1rem 0.5rem 0.5rem;
		transition: background-color 300ms;
		border-radius: 0.5rem;
		background-color: var(--primary-200);
	}

	:global(.dark) .release-wrapper {
		background-color: var(--bg-dark1);
	}

	.release-wrapper:hover {
		background-color: var(--primary-300);
	}

	:global(.dark) .release-wrapper:hover {
		background-color: var(--dark-400);
	}
</style>
