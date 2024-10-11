<script lang="ts">
	import type { BookReview } from '$lib/server/db/reviews/reviews';
	import type { Nullish } from '$lib/server/zod/schema';
	import Review from './Review.svelte';
	import ReviewContainer from './ReviewContainer.svelte';

	export let itemType: 'book' | 'series';
	export let itemId: number;
	export let review: BookReview;
	export let userHasReview: boolean;
	export let imageUrl: Nullish<string>;
	export let reviewSubjectTitle: string;
</script>

<ReviewContainer
	{imageUrl}
	{itemId}
	{itemType}
	{userHasReview}
	{reviewSubjectTitle}
	showWriteReviewLink={userHasReview}
	singleReview={true}
>
	<Review {review} {itemType} singleReview={true} />
</ReviewContainer>
