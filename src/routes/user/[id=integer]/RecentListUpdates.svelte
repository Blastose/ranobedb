<script lang="ts">
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import ReadingListBadge from '$lib/components/book/ReadingListBadge.svelte';
	import Cover from '$lib/components/image/Cover.svelte';
	import { relativeTime } from '$lib/utils/relative-time.js';
	import type { Book } from '$lib/server/db/books/books';
	import type { SeriesMany } from '$lib/server/db/series/series';
	import Icon from '$lib/components/icon/Icon.svelte';

	interface Props {
		title: string;
		items: { items: Book[]; type: 'book' } | { items: SeriesMany[]; type: 'series' };
		itemType: 'book' | 'series';
		viewAllHref: string;
	}

	let { title, items, itemType, viewAllHref }: Props = $props();
</script>

{#if items.items.length > 0}
	<section>
		<div class="flex gap-2 items-center">
			<h2 class="font-bold text-lg">
				{title}
			</h2>
			<a href={viewAllHref} class="text-xs ml-6">View all</a>
		</div>

		<div class="flex flex-col gap-1">
			{#each items.items as item, idx (item.id)}
				<div class="rounded-lg px-2 py-1 grid grid-cols-[60px_1fr] gap-2">
					<div class="pt-1">
						<a href="/{itemType}/{item.id}">
							{#if items.type === 'book'}
								<Cover obj={items.items[idx]} />
							{:else}
								<Cover obj={items.items[idx].book} />
							{/if}
						</a>
					</div>
					<div class="flex flex-col gap-1">
						<a class="link line-clamp-2 w-fit" href="/{itemType}/{item.id}"
							><TitleDisplay obj={item} /></a
						>
						<div class="flex gap-2 items-center">
							<ReadingListBadge
								badge={item.label?.label ?? ''}
								textSize={'compact'}
								shadow={false}
							/>
							{#if item.score}
								<div class="flex items-center gap-1">
									<Icon name="star" height="16" width="16" />
									<p class="text-xs sub-text-alt">Score: {Number(item.score)}</p>
								</div>
							{/if}
						</div>
						<div class="px-1 sub-text-alt text-xs">
							{#if items.type === 'series'}
								{@const vols_read = Number(
									items.items[idx].vols_read?.volumes_read ?? items.items[idx].c_vols_read?.count,
								)}
								{#if vols_read > 0}
									<p>
										{vols_read} / {items.items[idx].volumes?.count} vols
									</p>
								{/if}
							{/if}
							{#if item.last_updated}
								<p title={item.last_updated.toLocaleString()}>
									{relativeTime(item.last_updated.getTime() / 1000, true)}
								</p>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}
