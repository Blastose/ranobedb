<script lang="ts">
	import Description from '../book/Description.svelte';
	import Icon from '../icon/Icon.svelte';
	import PaginationContainer from '../pagination/PaginationContainer.svelte';

	export let currentPage: number;
	export let totalPages: number;
	export let count: string;
	export let reviews;
</script>

<PaginationContainer {currentPage} {totalPages} results={count} showTopPages={false}>
	<div class="grid grid-cols-1 @md:grid-cols-2 gap-2 @sm:gap-4">
		{#each reviews as review (review.review_id)}
			<div class="flex flex-col gap-2">
				<div>
					<div class="flex justify-between">
						<p>
							By <a class="link" href="/user/{review.user_id}">{review.username}</a>
						</p>
						<time datetime="">{new Date(review.created).toLocaleDateString('sv')}</time>
					</div>
					<p><a href="/review/book/{review.review_id}">Full</a></p>
					<div class="flex gap-2 items-center">
						Score:
						<div class="flex">
							<Icon class="text-[#ffa844]" name="star" height="24" width="24" /> 10/10
						</div>
					</div>
				</div>

				<Description description={review.review_text} maxHeight={128} />
			</div>
		{/each}
	</div>
</PaginationContainer>
