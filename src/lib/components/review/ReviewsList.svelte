<script lang="ts">
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import type { BookReview } from '$lib/server/db/reviews/reviews';
	import Review from './Review.svelte';

	export let currentPage: number;
	export let totalPages: number;
	export let results: string;
	export let reviews: BookReview[];
	export let itemType: 'book' | 'series';
</script>

<PaginationContainer {currentPage} {totalPages} {results} showTopPages={false}>
	<div class="grid grid-cols-1 @md:grid-cols-2 gap-4 @sm:gap-6">
		{#each reviews as review (review.review_id)}
			<Review {review} {itemType} />
		{/each}
	</div>
</PaginationContainer>
