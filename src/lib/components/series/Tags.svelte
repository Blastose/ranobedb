<script lang="ts">
	import { groupBy } from '$lib/db/array';
	import type { Series } from '$lib/server/db/series/series';

	export let tags: Series['tags'];

	$: groupedTags = groupBy(tags, (v) => v.ttype);
</script>

<div class="flex flex-wrap gap-x-6 gap-y-2">
	{#each Object.entries(groupedTags) as [key, tagss]}
		<section>
			<h2 class="font-bold text-lg capitalize">{key}</h2>

			<div class="flex flex-wrap gap-2 mt-1">
				{#each tagss as tag}
					<a href="/series?tagsInclude={tag.id}" class="text-sm px-2 tag">{tag.name}</a>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	.tag {
		background-color: var(--primary-200);
		border-radius: 1.5rem;
	}

	:global(.dark) .tag {
		background-color: var(--dark-500);
	}
</style>
