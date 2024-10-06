<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';

	export let rating: {
		score: string | number;
		count: string | number | bigint;
	} | null;
</script>

{#if rating}
	<section>
		<div class="flex gap-4">
			<div class="flex items-center gap-1">
				<Icon class="text-[#ffa844]" name="star" height="24" width="24" />
				<span>{Number(rating.score).toFixed(1)} from {rating.count} scores</span>
			</div>
			<!-- TODO -->
			<!-- <p class="font-semibold">
				<a class="flex items-center link" href="/">{234} reviews</a>
			</p> -->
		</div>
	</section>
{/if}
