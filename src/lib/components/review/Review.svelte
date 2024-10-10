<script lang="ts">
	import Description from '$lib/components/book/Description.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { BookReview } from '$lib/server/db/reviews/reviews';
	import MarkdownToHtml from '../markdown/MarkdownToHtml.svelte';

	export let review: BookReview;
	export let itemType: 'book' | 'series';
	export let singleReview: boolean = false;
	export let itemTitle: string | undefined = undefined;
	export let imageUrl: string | null = null;

	let showReview: boolean = false;
</script>

<div class={imageUrl ? 'grid grid-cols-[64px_1fr] gap-x-4' : ''}>
	{#if imageUrl}
		<div class="pt-1">
			<img class="rounded-md" src={imageUrl} height="340" width="200" alt="" />
		</div>
	{/if}
	<div class="flex flex-col gap-2">
		<div>
			{#if itemTitle}
				<p class="font-semibold">
					<a class="link" href="/{itemType}/{review.item_id}">{itemTitle}</a> ({itemType})
				</p>
			{/if}
			<div class="flex justify-between">
				<p>
					By <a class="link" href="/user/{review.user_id}">{review.username}</a>
				</p>
				<time datetime="">{new Date(review.created).toLocaleDateString('sv')}</time>
			</div>
		</div>

		<div class="flex gap-2 items-center">
			Score:
			<div class="flex">
				<Icon class="text-[#ffa844]" name="star" height="24" width="24" /> 10/10
			</div>
		</div>

		{#if !singleReview}
			{#if review.spoiler && !showReview}
				<button
					on:click={() => {
						showReview = true;
					}}>This review contains spoilers. Click to show.</button
				>
			{:else}
				<Description description={review.review_text} maxHeight={128} />
			{/if}
		{:else if review.spoiler && !showReview}
			<button
				on:click={() => {
					showReview = true;
				}}>This review contains spoilers. Click to show.</button
			>
		{:else}
			<div class="max-w-5xl">
				<MarkdownToHtml markdown={review.review_text} type="full" />
			</div>
		{/if}

		{#if !singleReview}
			<div>
				<a class="link" href="/review/{itemType}/{review.review_id}">View in full view</a>
			</div>
		{/if}
	</div>
</div>
