<script lang="ts">
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import Cover from '$lib/components/image/Cover.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs';
	import type {
		BookReviewWithBookObj,
		SeriesReviewWithSeriesObj,
	} from '$lib/server/db/reviews/reviews';
	import { relativeTime } from '$lib/utils/relative-time';
	import Icon from '../icon/Icon.svelte';
	import Spoilers from './Spoilers.svelte';

	interface Props {
		reviews:
			| { reviews: BookReviewWithBookObj[]; type: 'book' }
			| { reviews: SeriesReviewWithSeriesObj[]; type: 'series' };
	}

	let { reviews }: Props = $props();
	const displayPrefs = getDisplayPrefsContext();
</script>

<section class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-bold">Latest {reviews.type} reviews</h2>
		<p class="sub-text-alt text-sm font-semibold"><a href="/reviews">View all</a></p>
	</div>
	<div class="grid grid-cols-1 gap-4 @md:grid-cols-2">
		{#each reviews.reviews as review}
			<div class="grid grid-cols-[64px_1fr] gap-4 @md:grid-cols-[72px_1fr]">
				<a
					href="/{reviews.type}/{review.item_id}"
					aria-label={getTitleDisplay({ obj: review.obj!, prefs: $displayPrefs.title_prefs })}
				>
					<Cover image={review.obj!.image} useDefaultCoverAspectRatio={true}></Cover>
				</a>
				<div>
					<p>
						<a href="/user/{review.user_id}" class="link">{review.username}</a> reviewed
						<a href="/review/{reviews.type}/{review.review_id}" class="link"
							><TitleDisplay obj={review.obj!} /></a
						>
					</p>
					<div class="flex items-center gap-2 text-sm">
						{#if review.score}
							<p class="flex items-center gap-1">
								<Icon class="text-[#ffa844]" name="star" height="18" width="18" />{Number(
									review.score,
								)} / 10
							</p>
							•
						{/if}
						<p class="sub-text-alt">
							{relativeTime(review.last_updated.getTime() / 1000)}
						</p>
					</div>
					{#if review.spoiler}
						<Spoilers />
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>
