<script lang="ts">
	import type { BookReview } from '$lib/server/db/reviews/reviews';
	import type { Nullish } from '$lib/server/zod/schema';
	import Review from './Review.svelte';
	import ReviewContainer from './ReviewContainer.svelte';

	interface Props {
		itemType: 'book' | 'series';
		itemId: number;
		review: BookReview;
		userHasReview: boolean;
		imageUrl: Nullish<string>;
		reviewSubjectTitle: string;
	}

	let { itemType, itemId, review, userHasReview, imageUrl, reviewSubjectTitle }: Props = $props();
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
