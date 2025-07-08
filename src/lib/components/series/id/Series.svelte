<script lang="ts">
	import Hr from '$lib/components/layout/Hr.svelte';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import type { Series } from '$lib/server/db/series/series';
	import type { User } from '$lib/server/lucia/lucia';
	import { groupBy } from '$lib/db/array';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import { getDisplayPrefsContext, getTitleDisplay, getTitleDisplaySub } from '$lib/display/prefs';
	import BookImage from '$lib/components/book/BookImage.svelte';
	import Description from '$lib/components/book/Description.svelte';
	import PublishersSection from '$lib/components/publisher/PublishersSection.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import {
		aniDbLink,
		anilistLink,
		bookwalkerSeriesLink,
		malLink,
		wikidataLink,
	} from '$lib/components/db-links/db-ext-links';
	import DbExtLinkShort from '$lib/components/db-links/DbExtLinkShort.svelte';
	import TitlesSection from '$lib/components/titles/TitlesSection.svelte';
	import Collapsible from '$lib/components/display/Collapsible.svelte';
	import StaffsSectionGroupedLang from '$lib/components/staff/StaffsSectionGroupedLang.svelte';
	import SeriesModal from './SeriesModal.svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { userListBookBatchSchema, userListSeriesSchema } from '$lib/server/zod/schema';
	import { buildRedirectUrl } from '$lib/utils/url';
	import { page } from '$app/state';
	import Tags from '../Tags.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';
	import UserStats from '$lib/components/shared/UserStats.svelte';
	import Rating from '$lib/components/shared/Rating.svelte';
	import SeriesBatchBookModal from './SeriesBatchBookModal.svelte';

	interface Props {
		series: Series;
		user: User | null;
		revision: number | undefined;
		userListSeriesForm?: SuperValidated<Infer<typeof userListSeriesSchema>> | undefined;
		userListBookBatchForm?: SuperValidated<Infer<typeof userListBookBatchSchema>> | undefined;
		allCustLabels?: { id: number; label: string }[] | undefined;
	}

	let {
		series,
		user,
		revision,
		userListSeriesForm = undefined,
		userListBookBatchForm = undefined,
		allCustLabels = undefined,
	}: Props = $props();

	let child_series = $derived(groupBy(series.child_series, (item) => item.relation_type));
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
	<div>
		<p class="text-sm font-bold -mt-2">
			{series.books.filter((v) => v.book_type === 'main').length} main books • {series.books.length}
			total books
		</p>
		<div class="pt-2 pb-1">
			<Rating
				rating={series.rating}
				itemId={series.id}
				itemType="series"
				numReviews={Number(series.num_reviews?.count || 0)}
			/>
		</div>
	</div>

	{#if userListSeriesForm}
		{#if user}
			<SeriesModal {series} {userListSeriesForm} allCustLabels={allCustLabels ?? []} />

			{#if userListBookBatchForm && userListSeriesForm.data.labels.at(0)?.id}
				<SeriesBatchBookModal {series} {userListBookBatchForm} />
			{/if}
		{:else}
			<a class="primary-btn w-full max-w-xs" href={buildRedirectUrl(page.url, '/login')}
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

		{#if series.end_date === 99999999 && series.books.at(-1)?.c_release_date !== undefined}
			<div>
				<dt>Latest release:</dt>
				<dd>
					{new DateNumber(series.books.at(-1)?.c_release_date || 99999999).getDateFormatted()}
				</dd>
			</div>
		{/if}

		<div>
			<dt>Publication status:</dt>
			<dd>{series.publication_status}</dd>
		</div>
	</dl>

	{#if series.description}
		<section>
			<h2 class="font-bold">Note</h2>
			<MarkdownToHtml markdown={series.description} type="full" />
		</section>
	{/if}

	<TitlesSection titles={series.titles} />

	{#if series.aliases}
		<section>
			<Collapsible open={false}>
				{#snippet summary()}
					<h2 class="font-bold text-lg">Aliases</h2>
				{/snippet}
				{#snippet details()}
					<p>{series.aliases.split('\n').join(', ')}</p>
				{/snippet}
			</Collapsible>
		</section>
	{/if}

	<Tags tags={series.tags} />

	<section>
		<h2 class="font-bold text-lg">Links</h2>
		{#if series.website || series.web_novel || series.bookwalker_id || series.anidb_id || series.wikidata_id || series.mal_id || series.anilist_id}
			<div class="flex flex-wrap gap-x-4">
				{#if series.website}
					<a href={series.website} target="_blank" class="link">Website</a>
				{/if}
				{#if series.web_novel}
					<a href={series.web_novel} target="_blank" class="link">Web novel</a>
				{/if}
				{#if series.bookwalker_id}
					<DbExtLinkShort fullLink={{ ...bookwalkerSeriesLink, value: series.bookwalker_id }} />
				{/if}
				{#if series.anilist_id}
					<DbExtLinkShort fullLink={{ ...anilistLink, value: series.anilist_id }} />
				{/if}
				{#if series.mal_id}
					<DbExtLinkShort fullLink={{ ...malLink, value: series.mal_id }} />
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

	<StaffsSectionGroupedLang olang={series.olang} staffs={series.staff} onlyOlang={false} />

	<PublishersSection publishers={series.publishers} olang={series.olang} onlyOpenOlang={false} />

	<section class="flex flex-col gap-2">
		<h2 class="text-lg font-bold">Books in series</h2>

		{#if series.books.length > 0}
			<BookImageContainer moreColumns={true}>
				{#each series.books as book, index (book.id)}
					<BookImage {book} urlPrefix="/book/">
						{#if book.label}
							<BookImageBadge badges={[`${book.label.label}`]} location="top-right" />
						{/if}
						<BookImageBadge badges={[`#${index + 1}`]} location="bottom-right" />
					</BookImage>
				{/each}
			</BookImageContainer>
		{:else}
			<p class="italic">None</p>
		{/if}
	</section>

	<UserStats
		rating={series.rating}
		type="series"
		user_stats_score={series.user_stats_score}
		user_stats_label={series.user_stats_label}
	/>
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
