<script lang="ts">
	import Description from '$lib/components/book/Description.svelte';
	import Icon from '$lib/components/icon/Icon.svelte';
	import type { BookReview } from '$lib/server/db/reviews/reviews';
	import MarkdownToHtml from '../markdown/MarkdownToHtml.svelte';

	interface Props {
		review: BookReview;
		itemType: 'book' | 'series';
		singleReview?: boolean;
		itemTitle?: string | undefined;
		imageUrl?: string | null;
	}

	let {
		review,
		itemType,
		singleReview = false,
		itemTitle = undefined,
		imageUrl = null,
	}: Props = $props();

	let showReview: boolean = $state(false);
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
				<time>{review.created.toLocaleDateString('sv')}</time>
			</div>
		</div>

		<div>
			<div class="flex gap-2 items-center">
				Score:
				{#if review.score}
					<div class="flex gap-1">
						<Icon class="text-[#ffa844]" name="star" height="24" width="24" />
						{review.score} / 10
					</div>
				{:else}
					No score given
				{/if}
			</div>
			{#if review.volumes_read}
				<div>Volumes read: {review.volumes_read}</div>
			{/if}
		</div>

		{#if !singleReview}
			{#if review.spoiler && !showReview}
				<button
					onclick={() => {
						showReview = true;
					}}>This review contains spoilers. Click to show.</button
				>
			{:else}
				<Description description={review.review_text!} maxHeight={128} />
			{/if}
		{:else if review.spoiler && !showReview}
			<button
				onclick={() => {
					showReview = true;
				}}>This review contains spoilers. Click to show.</button
			>
		{:else}
			<div class="max-w-5xl">
				<MarkdownToHtml markdown={review.review_text!} type="full" />
			</div>
		{/if}

		{#if !singleReview}
			<div>
				<a class="link" href="/review/{itemType}/{review.review_id}">View in full view</a>
			</div>
		{/if}
	</div>
</div>
