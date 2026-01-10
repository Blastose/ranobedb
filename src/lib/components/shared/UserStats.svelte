<script lang="ts">
	import { defaultUserListLabelsArray } from '$lib/db/dbConsts';

	interface Props {
		user_stats_score: {
			gs: number;
			count: string | number | bigint;
		}[];
		user_stats_label: {
			label_id: number;
			count: string | number | bigint;
		}[];
		rating: {
			score: string | number;
			count: string | number | bigint;
		} | null;
		type: 'book' | 'series';
		id: number;
	}

	let { user_stats_score, user_stats_label, rating, type, id }: Props = $props();

	let scoreCount = $derived(user_stats_score.reduce((a, c) => a + Number(c.count), 0));
	let listCounts = $derived(user_stats_label.reduce((a, c) => a + Number(c.count), 0));
</script>

<div class="grid grid-cols-1 @md:grid-cols-2 gap-y-4 gap-x-2">
	<section>
		<h2 class="font-bold text-lg">User scores</h2>
		{#if scoreCount > 0}
			<div class="grid grid-cols-[min-content_1fr] gap-x-2 text-sm">
				{#each user_stats_score as user_stat_score}
					<div class="whitespace-nowrap text-right">
						{user_stat_score.gs}
					</div>
					<div class="flex items-center gap-1">
						{#if ((Number(user_stat_score.count) / scoreCount) * 100) / 1.4 > 0}
							<div
								class="bg-[var(--primary-500)] h-[80%] rounded-sm"
								style="width: {((Number(user_stat_score.count) / scoreCount) * 100) / 1.4}%;"
							></div>
						{/if}
						<div>
							{((Number(user_stat_score.count) / scoreCount) * 100).toFixed(1)}% ({user_stat_score.count})
						</div>
					</div>
				{/each}
			</div>
			<div class="text-sm flex flex-col items-center">
				<p>{Number(rating?.score).toFixed(2)} average from {scoreCount} total scores</p>
			</div>
		{:else}
			<p class="italic">There are no scores for this {type} yet</p>
		{/if}
	</section>

	<section>
		<h2 class="font-bold text-lg">User list stats</h2>
		{#if listCounts > 0}
			<div>
				{#each defaultUserListLabelsArray as ar, index}
					<div>
						{ar}: {user_stats_label.find((v) => v.label_id === index + 1)?.count ?? 0}
					</div>
				{/each}
				<div>Total: {listCounts}</div>
			</div>
		{:else}
			<p class="italic">No users have added this {type} to their list yet</p>
		{/if}
		{#if listCounts > 0}
			<p class="mt-4"><a class="link" href="/{type}/{id}/stats">View all stats</a></p>
		{/if}
	</section>
</div>
