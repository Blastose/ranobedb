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
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import {
		aniDbLink,
		bookwalkerSeriesLink,
		wikidataLink,
	} from '$lib/components/db-links/db-ext-links';
	import DbExtLinkShort from '$lib/components/db-links/DbExtLinkShort.svelte';

	export let series: Series;
	export let user: User | null;
	export let revision: number | undefined;

	$: child_series = groupBy(series.child_series, (item) => item.relation_type);
	const displayPrefs = getDisplayPrefsContext();
</script>

<DBItemShell
	dbItem="series"
	{revision}
	name={getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs })}
	subName={getTitleDisplaySub({ obj: series, prefs: $displayPrefs.title_prefs })}
	{user}
	item={series}
	copyTo={{ to: ['book'], langs: series.titles.map((t) => t.lang) }}
>
	<Description description={series.description} maxHeight={100} />
	<div class="text-sm">
		<p class="sub-text">
			{series.books.filter((v) => v.book_type === 'main').length} main books • {series.books.length}
			total books
		</p>

		<p class="sub-text">
			Original run: {new DateNumber(series.start_date).getDateFormatted()} – {new DateNumber(
				series.end_date,
			).getDateFormatted()}
		</p>

		<div class="flex gap-2 sub-text">
			<dt>Publication status:</dt>
			<dd>{series.publication_status}</dd>
		</div>
	</div>

	{#if series.aliases}
		<section>
			<h2 class="font-bold text-lg">Aliases</h2>
			<p>{series.aliases.split('\n').join(', ')}</p>
		</section>
	{/if}

	<section>
		<h2 class="font-bold text-lg">Links</h2>
		<div class="flex flex-wrap gap-x-4">
			{#if series.web_novel}
				<a href={series.web_novel} target="_blank" class="link">Web novel</a>
			{/if}
			{#if series.bookwalker_id}
				<DbExtLinkShort fullLink={{ ...bookwalkerSeriesLink, value: series.bookwalker_id }} />
			{/if}
			{#if series.anidb_id}
				<DbExtLinkShort fullLink={{ ...aniDbLink, value: series.anidb_id }} />
			{/if}
			{#if series.wikidata_id}
				<DbExtLinkShort fullLink={{ ...wikidataLink, value: series.wikidata_id }} />
			{/if}
		</div>
	</section>

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

	<PublishersSection publishers={series.publishers} olang={series.olang} />

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
