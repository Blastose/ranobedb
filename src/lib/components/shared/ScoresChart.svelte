<script lang="ts">
	interface Props {
		user_stats_score: {
			gs: number;
			count: string | number | bigint;
		}[];
		rating: {
			score: string | number;
			count: string | number | bigint;
		} | null;
	}

	let { user_stats_score, rating }: Props = $props();

	let scoreCount = $derived(user_stats_score.reduce((a, c) => a + Number(c.count), 0));
</script>

<div class="flex flex-col gap-2">
	<div class="grid grid-cols-[min-content_1fr] gap-x-2 text-sm">
		{#each user_stats_score as user_stat_score}
			{@const pct = (Number(user_stat_score.count) / scoreCount) * 100}
			<div class="whitespace-nowrap text-right">
				{user_stat_score.gs}
			</div>
			<div class="flex items-center gap-1">
				{#if pct / 1.4 > 0}
					<div
						class="bg-[var(--primary-500)] h-[80%] rounded-sm"
						style="width: {pct / 1.4}%;"
					></div>
				{/if}
				<div>
					{pct === 0 ? '0%' : `${pct.toFixed(1)}%`} ({user_stat_score.count})
				</div>
			</div>
		{/each}
	</div>
	<div class="text-sm flex flex-col items-center">
		<p class="text-center">
			{Number(rating?.score).toFixed(2)} average from {scoreCount} total scores
		</p>
	</div>
</div>
