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
	import DbExtLink from '$lib/components/db-links/DbExtLink.svelte';

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
	<div>
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

	<Description description={series.description} maxHeight={100} />

	<section>
		<h2 class="font-bold text-lg">Aliases</h2>
		<p>{series.aliases.split('\n').join(', ')}</p>
	</section>

	<section>
		<h2 class="font-bold text-lg">Links</h2>
		<div class="flex flex-wrap gap-x-4">
			{#if series.web_novel}
				<div>
					<dt>Web novel:</dt>
					<dd><a href={series.web_novel} target="_blank" class="link">{series.web_novel}</a></dd>
				</div>
			{/if}

			{#if series.bookwalker_id}
				<div>
					<dt>Bookwalker:</dt>
					<dd>
						<DbExtLink fullLink={{ ...bookwalkerSeriesLink, value: series.bookwalker_id }} />
					</dd>
				</div>
			{/if}

			{#if series.anidb_id}
				<div>
					<dt>AniDB:</dt>
					<dd><DbExtLink fullLink={{ ...aniDbLink, value: series.anidb_id }} /></dd>
				</div>
			{/if}

			{#if series.wikidata_id}
				<div>
					<dt>Wikidata:</dt>
					<dd><DbExtLink fullLink={{ ...wikidataLink, value: series.wikidata_id }} /></dd>
				</div>
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
