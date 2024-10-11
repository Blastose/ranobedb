<script lang="ts">
	import type { BookReview } from '$lib/server/db/reviews/reviews';
	import type { Nullish } from '$lib/server/zod/schema';
	import ReviewContainer from './ReviewContainer.svelte';
	import ReviewsList from './ReviewsList.svelte';

	export let itemType: 'book' | 'series';
	export let itemId: number;
	export let currentPage: number;
	export let totalPages: number;
	export let results: string;
	export let reviews: BookReview[];
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
	showWriteReviewLink={true}
	singleReview={false}
>
	<ReviewsList {currentPage} {results} {reviews} {totalPages} {itemType} />
</ReviewContainer>
