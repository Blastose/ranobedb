<script lang="ts">
	import type { BookReview } from '$lib/server/db/reviews/reviews';
	import type { Nullish } from '$lib/server/zod/schema';
	import ReviewContainer from './ReviewContainer.svelte';
	import ReviewsList from './ReviewsList.svelte';

	interface Props {
		itemType: 'book' | 'series';
		itemId: number;
		currentPage: number;
		totalPages: number;
		results: string;
		reviews: BookReview[];
		userHasReview: boolean;
		imageUrl: Nullish<string>;
		reviewSubjectTitle: string;
	}

	let {
		itemType,
		itemId,
		currentPage,
		totalPages,
		results,
		reviews,
		userHasReview,
		imageUrl,
		reviewSubjectTitle,
	}: Props = $props();
</script>

<ReviewContainer
	{imageUrl}
	{itemId}
	{itemType}
	{userHasReview}
	{reviewSubjectTitle}
	showWriteReviewLink={true}
	singleReview={false}
>
	<ReviewsList {currentPage} {results} {reviews} {totalPages} {itemType} />
</ReviewContainer>
