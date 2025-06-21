<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import BookCarousel from '$lib/components/book/BookCarousel.svelte';
	import BookImage from '$lib/components/book/BookImage.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import ReleaseBookImageCarousel from '$lib/components/release/ReleaseBookImageCarousel.svelte';
	import { buildRevisionLink, dbItemMap, getHistoryEntryTitle } from '$lib/db/revision.js';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';
	import { relativeTime } from '$lib/utils/relative-time.js';
	import HomeReviews from '$lib/components/review/HomeReviews.svelte';

	let { data } = $props();

	const displayPrefs = getDisplayPrefsContext();

	let series_img_1 = $derived(data.mostPopularSeries.at(6));
	let series_img_2 = $derived(data.mostPopularSeries.at(7));
</script>

<PageTitle title="Home" />

<MetaTags
	title="RanobeDB"
	description="Welcome to RanobeDB! We are a light novel database and our mission is to provide a comprehensive database of Japanese light novels and any official translations. This website is an open, editable database and you can contribute new information or corrections to the database."
	site_name="RanobeDB"
	type="website"
/>

<main class="container-rndb flex flex-col gap-12">
	<div class="mt-4 grid grid-cols-1 @md:grid-cols-[5fr_2fr] gap-8 items-center">
		<div class="flex flex-col gap-2">
			<h1 class="font-bold text-4xl">Welcome to RanobeDB</h1>

			<div>
				<p class="sub-text-alt">
					We are a light novel database and our mission is to provide a comprehensive database of
					Japanese light novels and any official translations.
					<br />
					This website is an open, editable database and you can contribute new information or corrections
					to the database.
					<br />
				</p>

				<div class="pt-4 flex gap-2 sub-text-alt">
					<a href="/books" class="primary-btn">Browse books</a>
					<a href="/about" class="tet-btn">Learn more</a>
				</div>

				<div class="pt-4 flex gap-x-6 gap-y-2 flex-wrap sub-text-alt">
					<div class="flex gap-1 text-sm items-center">
						<Icon name="book" /> 45K+ Total books
					</div>
					<div class="flex gap-1 text-sm items-center">
						<Icon name="bookshelf" /> 17K+ Book series
					</div>
				</div>
			</div>
		</div>

		<div class="hidden @md:block">
			<div class="grid @md:grid-cols-1 @lg:grid-cols-2 gap-1 items-center">
				{#if series_img_1}
					<a href="/series/{series_img_1.id}"
						><img
							loading="lazy"
							width={series_img_1.book?.image?.width}
							height={series_img_1.book?.image?.height}
							class="hidden @lg:block rounded-md rotate-[-3deg]"
							src="{PUBLIC_IMAGE_URL}{series_img_1.book?.image?.filename}"
							alt="Cover image for {getTitleDisplay({
								obj: series_img_1,
								prefs: $displayPrefs.title_prefs,
							})}"
						/>
					</a>
				{/if}
				{#if series_img_2}
					<a href="/series/{series_img_2.id}">
						<img
							loading="lazy"
							width={series_img_2.book?.image?.width}
							height={series_img_2.book?.image?.height}
							class="rounded-md rotate-[3deg]"
							src="{PUBLIC_IMAGE_URL}{series_img_2.book?.image?.filename}"
							alt="Cover image for {getTitleDisplay({
								obj: series_img_2,
								prefs: $displayPrefs.title_prefs,
							})}"
						/>
					</a>
				{/if}
			</div>
		</div>
	</div>

	<Hr />

	<BookCarousel>
		{#snippet link()}
			<h2 class="text-lg font-bold">Most popular series</h2>
		{/snippet}
		{#snippet items()}
			{#each data.mostPopularSeries.slice(0, 6) as series (series.id)}
				<div class="carousel-item-large">
					<BookImage
						book={{
							title: series.title,
							romaji: series.romaji,
							id: series.id,
							image: series.book?.image,
							lang: series.lang,
							romaji_orig: series.romaji_orig,
							title_orig: series.title_orig,
						}}
						urlPrefix="/series/"
					></BookImage>
				</div>
			{/each}
		{/snippet}
	</BookCarousel>

	<HomeReviews reviews={{ reviews: data.seriesReviews, type: 'series' }} />
	<HomeReviews reviews={{ reviews: data.bookReviews, type: 'book' }} />

	<section>
		<ReleaseBookImageCarousel releases={data.upcomingReleases} heading="Upcoming releases" />
	</section>

	<section>
		<ReleaseBookImageCarousel releases={data.recentlyReleased} heading="Recently released" />
	</section>

	<section>
		<div class="flex justify-between items-center">
			<h2 class="text-lg font-bold">Recent changes</h2>
			<p class="text-sm font-semibold sub-text-alt"><a href="/history">View all</a></p>
		</div>
		<div class="flex flex-col gap-1">
			{#each data.recentChanges as recentChange}
				{@const link = buildRevisionLink(
					recentChange.item_name,
					recentChange.item_id,
					recentChange.revision,
				)}
				<div>
					<p>
						<span>{dbItemMap[recentChange.item_name]}:</span>
						<span
							><a href={link.href} class="link"
								>{getHistoryEntryTitle(recentChange, $displayPrefs)}</a
							></span
						>
					</p>
					<p class="text-sm sub-text-alt">
						<a href="/user/{recentChange.id_numeric}" class="link text-base"
							>{recentChange.username}</a
						>
						• {relativeTime(recentChange.added.getTime() / 1000)}
						• <span>{recentChange.comments}</span>
					</p>
				</div>
			{/each}
		</div>
	</section>
</main>
