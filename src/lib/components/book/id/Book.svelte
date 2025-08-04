<script lang="ts">
	import type { BookOne, BookSeries } from '$lib/server/db/books/books';
	import { getBgImageStyle, getThemeContext } from '$lib/stores/themeStore';
	import type { User } from '$lib/server/lucia/lucia';
	import BookModal from './BookModal.svelte';
	import type { userListBookSchema, userListReleaseSchema } from '$lib/server/zod/schema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import Description from '$lib/components/book/Description.svelte';
	import VisibilityDisplay from '$lib/components/layout/db/VisibilityDisplay.svelte';
	import VisibilityDisplayPerm from '$lib/components/layout/db/VisibilityDisplayPerm.svelte';
	import BookImage from '../BookImage.svelte';
	import BookCarousel from '../BookCarousel.svelte';
	import { buildRedirectUrl } from '$lib/utils/url';
	import { page } from '$app/state';
	import { getDisplayPrefsContext } from '$lib/display/prefs';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import PublishersSection from '$lib/components/publisher/PublishersSection.svelte';
	import BookReleases from './BookReleases.svelte';
	import StaffsSectionSnippet from '$lib/components/staff/StaffsSectionSnippet.svelte';
	import { sortByLang } from '$lib/db/array';
	import TitlesSection from '$lib/components/titles/TitlesSection.svelte';
	import { buildImageUrl } from '../book';
	import Tags from '$lib/components/series/Tags.svelte';
	import LangChip from '$lib/components/titles/LangChip.svelte';
	import BookImageBadge from '../BookImageBadge.svelte';
	import UserStats from '$lib/components/shared/UserStats.svelte';
	import Rating from '$lib/components/shared/Rating.svelte';

	interface Props {
		book: BookOne;
		book_series: BookSeries | undefined;
		revision: number | undefined;
		user: User | null;
		userListForm?: SuperValidated<Infer<typeof userListBookSchema>> | undefined;
		allCustLabels?: { id: number; label: string }[] | undefined;
		userListReleaseForm?: SuperValidated<Infer<typeof userListReleaseSchema>> | undefined;
	}

	let {
		book,
		book_series,
		revision,
		user,
		userListForm = undefined,
		allCustLabels = undefined,
		userListReleaseForm = undefined,
	}: Props = $props();

	const theme = getThemeContext();
	let imageUrl = $derived(buildImageUrl(book.image?.filename));
	let bgImageStyle = $derived(getBgImageStyle($theme, imageUrl));
	let previousBook = $derived(
		book_series?.books[book_series?.books.findIndex((v) => v.id === book.id) - 1],
	); // We use [] brackets here because using -1 with .at() gets the last element of the array and we don't want that
	let nextBook = $derived(
		book_series?.books.at(book_series?.books.findIndex((v) => v.id === book.id) + 1),
	);
	const displayPrefs = getDisplayPrefsContext();
</script>

<div class="flex flex-col gap-4">
	<div class="banner-img {revision ? 'h-[128px]' : 'h-[256px]'}" style={bgImageStyle}>
		<div class="blur-image"></div>
	</div>

	<div class="-mt-32 z-10 flex flex-col gap-4">
		<div
			class="grid grid-cols-1 @sm:grid-cols-[168px_1fr] @md:grid-cols-[256px_1fr] gap-6 sm:gap-4 md:gap-8 pb-4"
		>
			<div class="flex flex-col items-center gap-4">
				{#if book.image}
					{#key book.image.id}
						<img
							width={book.image.width}
							height={book.image.height}
							class="max-w-[196px] h-fit @sm:max-w-[150px] @md:max-w-[200px] rounded-md shadow-sm"
							src={imageUrl}
							alt=""
							loading="lazy"
						/>
					{/key}
				{:else}
					<div class="bg-neutral-500 w-[240px] h-[320px] rounded-md">
						<p class="p-4">No cover</p>
					</div>
				{/if}

				{#if userListForm}
					{#if user}
						<!-- This div is needed to prevent the flex from above because the BookModal component has a portal -->
						<!-- so it will generate an empty gap space before hydration -->
						<div class="w-full">
							<BookModal {userListForm} {book} allCustLabels={allCustLabels ?? []} />
						</div>
					{:else}
						<a class="primary-btn w-full max-w-xs" href={buildRedirectUrl(page.url, '/login')}
							>Add to reading list</a
						>
					{/if}
				{/if}
			</div>

			<div>
				<h1 class="font-bold text-3xl sm:text-4xl">
					<TitleDisplay obj={book} />
				</h1>
				<p class="sub-text"><TitleDisplay obj={book} type="sub" /></p>

				<section class="pt-4">
					<VisibilityDisplay
						item={book}
						type="book"
						{user}
						copyTo={{ to: ['release', 'series'], langs: book.titles.map((t) => t.lang) }}
						{revision}
					/>
				</section>

				<section>
					<VisibilityDisplayPerm item={book} {user} />
				</section>

				<div class="flex justify-between @sm:justify-normal gap-6 pt-4">
					{#if previousBook}
						<a class="link" href="/book/{previousBook.id}">{'<-'} Previous book</a>
					{/if}
					{#if nextBook}
						<a class="link" href="/book/{nextBook.id}">Next book {'->'}</a>
					{/if}
				</div>

				<div class="pt-3 pb-2">
					<Rating
						rating={book.rating}
						itemId={book.id}
						itemType="book"
						numReviews={Number(book.num_reviews?.count) || undefined}
					/>
				</div>

				<section>
					<h2 class="font-bold text-lg">Description</h2>
					{#if book.description || book.description_ja}
						{#key book.id}
							{#if $displayPrefs.descriptions === 'en'}
								<Description description={(book.description || book.description_ja) ?? ''} />
							{:else if $displayPrefs.descriptions === 'ja'}
								<Description description={book.description_ja || book.description} />
							{/if}
						{/key}
					{:else}
						<p>This book doesn't have a description yet.</p>
					{/if}
				</section>
			</div>
		</div>

		<TitlesSection titles={book.titles} />

		{#if book_series && book_series.tags.length > 0}
			<Tags tags={book_series.tags || []} />
		{/if}

		<section>
			<h2 class="font-bold text-lg">Staff</h2>
			<div class="flex flex-col gap-y-2 gap-x-4">
				{#each sortByLang(book.editions, book.olang) as edition (edition.eid)}
					<div class="flex flex-col gap-2">
						<div class="grid grid-cols-[24px_1fr] font-semibold gap-1">
							<LangChip lang={edition.lang || book.olang} />
							<p>{edition.title}</p>
						</div>
						<StaffsSectionSnippet staffs={edition.staff} />
					</div>
				{/each}
			</div>
		</section>

		<PublishersSection publishers={book.publishers} olang={book.olang} onlyOpenOlang={false} />

		<BookReleases releases={book.releases} olang={book.olang} {userListReleaseForm} />

		{#if book_series}
			{#key book_series.id}
				<section>
					<h2 class="font-bold text-lg">Series</h2>
					<div class="flex flex-col gap-2">
						<BookCarousel>
							{#snippet link()}
								<a class="link w-fit font-bold" href="/series/{book_series.id}"
									><TitleDisplay obj={book_series} /></a
								>
							{/snippet}
							{#snippet items()}
								{#each book_series.books as other_book (other_book.id)}
									{@const isCurrent = other_book.id === book.id}
									<div class="carousel-item">
										<BookImage book={other_book} urlPrefix="/book/">
											{#if other_book.label}
												<BookImageBadge
													badges={[`${other_book.label.label}`]}
													location="top-right"
												/>
											{/if}
											{#if isCurrent}
												<BookImageBadge badges={['Viewing']} location="bottom-right" />
											{/if}
										</BookImage>
									</div>
								{/each}
							{/snippet}
						</BookCarousel>
					</div>
				</section>
			{/key}
		{/if}

		{#if revision === undefined}
			<UserStats
				rating={book.rating}
				type="book"
				user_stats_score={book.user_stats_score}
				user_stats_label={book.user_stats_label}
			/>
		{/if}
	</div>
</div>

<style>
	.banner-img {
		overflow: hidden;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 20% 20%;
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
	}

	.blur-image {
		height: 100%;
		width: 100%;
		backdrop-filter: blur(8px);
	}
</style>
