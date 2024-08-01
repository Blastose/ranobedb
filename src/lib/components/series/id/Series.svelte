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
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import {
		aniDbLink,
		bookwalkerSeriesLink,
		wikidataLink,
	} from '$lib/components/db-links/db-ext-links';
	import DbExtLinkShort from '$lib/components/db-links/DbExtLinkShort.svelte';
	import TitlesSection from '$lib/components/titles/TitlesSection.svelte';
	import Collapsible from '$lib/components/display/Collapsible.svelte';
	import StaffsSectionGroupedLang from '$lib/components/staff/StaffsSectionGroupedLang.svelte';
	import SeriesModal from './SeriesModal.svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { userListSeriesSchema } from '$lib/server/zod/schema';
	import { buildRedirectUrl } from '$lib/utils/url';
	import { page } from '$app/stores';
	import Tags from '../Tags.svelte';

	export let series: Series;
	export let user: User | null;
	export let revision: number | undefined;
	export let userListSeriesForm: SuperValidated<Infer<typeof userListSeriesSchema>> | undefined =
		undefined;

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
	<p class="text-sm font-bold -mt-2">
		{series.books.filter((v) => v.book_type === 'main').length} main books • {series.books.length}
		total books
	</p>

	{#if userListSeriesForm}
		{#if user}
			<SeriesModal {series} {userListSeriesForm} />
		{:else}
			<a class="primary-btn w-full max-w-xs" href={buildRedirectUrl($page.url, '/login')}
				>Add to reading list</a
			>
		{/if}
	{/if}

	{#if series.book_description && (series.book_description?.description?.length > 0 || series.book_description?.description_ja?.length > 0)}
		{#key series.id}
			{#if $displayPrefs.descriptions === 'en'}
				<Description
					description={series.book_description?.description ||
						series.book_description?.description_ja}
					maxHeight={100}
				/>
			{:else if $displayPrefs.descriptions === 'ja'}
				<Description
					description={series.book_description?.description_ja ||
						series.book_description?.description}
					maxHeight={100}
				/>
			{/if}
		{/key}
	{/if}

	<dl>
		<div>
			<dt>Original run:</dt>
			<dd>
				{new DateNumber(series.start_date).getDateFormatted('present')} – {new DateNumber(
					series.end_date,
				).getDateFormatted('present')}
			</dd>
		</div>

		{#if series.end_date === 99999999 && series.books.at(-1)?.release_date !== undefined}
			<div>
				<dt>Lastest release:</dt>
				<dd>
					{new DateNumber(series.books.at(-1)?.release_date || 99999999).getDateFormatted()}
				</dd>
			</div>
		{/if}

		<div>
			<dt>Publication status:</dt>
			<dd>{series.publication_status}</dd>
		</div>
	</dl>

	<TitlesSection titles={series.titles} />

	<Tags tags={series.tags} />

	{#if series.aliases}
		<section>
			<Collapsible open={false}>
				<svelte:fragment slot="summary">
					<h2 class="font-bold text-lg">Aliases</h2>
				</svelte:fragment>
				<svelte:fragment slot="details">
					<p>{series.aliases.split('\n').join(', ')}</p>
				</svelte:fragment>
			</Collapsible>
		</section>
	{/if}

	<section>
		<h2 class="font-bold text-lg">Links</h2>
		{#if series.web_novel || series.bookwalker_id || series.anidb_id || series.wikidata_id}
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
		{:else}
			<p class="italic">No links added</p>
		{/if}
	</section>

	<Hr />

	{#if Object.entries(child_series).length > 0}
		<section>
			<h2 class="font-bold text-lg">Related series</h2>
			<div class="flex flex-col gap-1">
				{#each Object.entries(child_series) as [key, series]}
					<div class="flex flex-col">
						<h3 class="font-semibold capitalize">{key}:</h3>
						{#each series as serie (serie.id)}
							<a class="link" href="/series/{serie.id}"
								>{getTitleDisplay({ obj: serie, prefs: $displayPrefs.title_prefs })}</a
							>
						{/each}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<StaffsSectionGroupedLang olang={series.olang} staffs={series.staff} onlyOlang={true} />

	<PublishersSection publishers={series.publishers} olang={series.olang} onlyOpenOlang={true} />

	<section class="flex flex-col gap-2">
		<h2 class="text-lg font-bold">Books in series</h2>

		{#if series.books.length > 0}
			<BookImageContainer moreColumns={true}>
				{#each series.books as book (book.id)}
					<BookImage {book} urlPrefix="/book/" />
				{/each}
			</BookImageContainer>
		{:else}
			<p class="italic">None</p>
		{/if}
	</section>
</DBItemShell>

<style>
	dl > div {
		display: grid;
		grid-template-columns: 164px 1fr;
	}

	dt {
		font-weight: 700;
	}
</style>
