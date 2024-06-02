<script lang="ts">
	import Hr from '$lib/components/layout/Hr.svelte';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import type { Series } from '$lib/server/db/series/series';
	import type { User } from 'lucia';
	import { groupBy } from '$lib/db/array';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import { getDisplayPrefsContext, getTitleDisplay, getTitleDisplaySub } from '$lib/display/prefs';
	import BookImage from '$lib/components/book/BookImage.svelte';
	import Description from '$lib/components/book/Description.svelte';
	import PublishersSection from '$lib/components/publisher/PublishersSection.svelte';
	import StaffsSectionSnippet from '$lib/components/staff/StaffsSectionSnippet.svelte';

	export let series: Series;
	export let user: User | null;
	export let isRevision: boolean;

	$: child_series = groupBy(series.child_series, (item) => item.relation_type);
	const displayPrefs = getDisplayPrefsContext();
</script>

<DBItemShell
	dbItem="series"
	{isRevision}
	name={getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs })}
	subName={getTitleDisplaySub({ obj: series, prefs: $displayPrefs.title_prefs })}
	{user}
	item={series}
>
	<p class="sub-text">
		{series.books.length} primary books • {series.books.length} total books
	</p>

	<Description description={series.description} maxHeight={100} />

	<div class="flex gap-2">
		<dt>Publication status:</dt>
		<dd>{series.publication_status}</dd>
	</div>

	<Hr />

	{#if Object.entries(child_series).length > 0}
		<section>
			<h2 class="font-bold text-lg">Related series</h2>
			<div class="flex flex-col gap-1">
				{#each Object.entries(child_series) as [key, series]}
					<div class="flex flex-col">
						<h3 class="font-semibold capitalize">{key}:</h3>
						{#each series as serie}
							<a class="link" href="/series/{serie.id}">{serie.title}</a>
						{/each}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<section class="flex flex-col gap-2">
		<h2 class="font-bold text-lg">Staff</h2>
		<StaffsSectionSnippet staffs={series.staff} />
	</section>

	<PublishersSection publishers={series.publishers} />

	<section class="flex flex-col gap-2">
		<h2 class="text-lg font-bold">Books in series</h2>

		{#if series.books.length > 0}
			<BookImageContainer moreColumns={true}>
				{#each series.books as book}
					<BookImage {book} urlPrefix="/book/" />
				{/each}
			</BookImageContainer>
		{:else}
			<p class="italic">None</p>
		{/if}
	</section>
</DBItemShell>
