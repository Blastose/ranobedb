<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';

	interface Props {
		rating: {
			score: string | number;
			count: string | number | bigint;
		} | null;
		numReviews: number | undefined;
		itemId: number;
		itemType: 'book' | 'series';
	}

	let { rating, numReviews, itemId, itemType }: Props = $props();
</script>

<section>
	<div class="flex gap-4 items-center">
		<div class="flex items-center gap-1">
			<Icon class="text-[#ffa844]" name="star" height="24" width="24" />
			<span>{Number(rating?.score ?? '0').toFixed(1)} from {rating?.count ?? 0} scores</span>
		</div>

		<p class="font-semibold">
			<a class="flex items-center link" href="/{itemType}/{itemId}/reviews"
				>{numReviews ?? 0} reviews</a
			>
		</p>
	</div>
</section>
