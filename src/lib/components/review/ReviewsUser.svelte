<script lang="ts">
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';
	import type { SeriesReviewWithSeriesObj } from '$lib/server/db/reviews/reviews';
	import { buildImageUrl } from '../book/book';
	import Review from './Review.svelte';

	export let heading: string;
	export let currentPage: number;
	export let totalPages: number;
	export let results: string;
	export let reviews: SeriesReviewWithSeriesObj[];
	export let itemType: 'book' | 'series';
	export let userIdNum: number;

	const displayPrefs = getDisplayPrefsContext();
</script>

<main class="container-rndb flex flex-col gap-4">
	<div class="flex flex-col gap-4">
		<h1 class="font-bold text-4xl">{heading}</h1>
		<a href="/user/{userIdNum}" class="w-fit link px-2">To profile</a>
	</div>

	<PaginationContainer {currentPage} {totalPages} {results} showTopPages={false}>
		<div class="grid grid-cols-1 gap-4 @sm:gap-6 max-w-4xl">
			{#each reviews as review (review.review_id)}
				{#if review.obj}
					{@const imageUrl = buildImageUrl(review.obj.image?.filename)}
					{@const title = getTitleDisplay({ obj: review.obj, prefs: $displayPrefs.title_prefs })}
					<Review {review} {itemType} itemTitle={title} {imageUrl} />
				{/if}
			{/each}
		</div>
	</PaginationContainer>
</main>
