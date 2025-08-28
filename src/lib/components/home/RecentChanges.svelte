<script lang="ts">
	import { buildRevisionLink, dbItemMap, getHistoryEntryTitle } from '$lib/db/revision';
	import { getDisplayPrefsContext } from '$lib/display/prefs';
	import { relativeTime } from '$lib/utils/relative-time';
	import type { PageProps } from '../../../routes/$types';

	let { data }: { data: PageProps['data'] } = $props();
	const displayPrefs = getDisplayPrefsContext();
</script>

<section>
	<div class="flex justify-between items-center">
		<h2 class="text-lg font-bold">Recent changes</h2>
		<p class="text-sm font-semibold sub-text-alt"><a href="/history">View all</a></p>
	</div>
	<div class="flex flex-col gap-1">
		{#each data.recentChanges as recentChange}
			{@const link = buildRevisionLink(
				recentChange.item_name,
				recentChange.item_id,
				recentChange.revision,
			)}
			<div>
				<p>
					<span>{dbItemMap[recentChange.item_name]}:</span>
					<span
						><a href={link.href} class="link">{getHistoryEntryTitle(recentChange, $displayPrefs)}</a
						></span
					>
				</p>
				<p class="text-sm sub-text-alt">
					<a href="/user/{recentChange.id_numeric}" class="link text-base"
						>{recentChange.username}</a
					>
					• {relativeTime(recentChange.added.getTime() / 1000)}
					• <span>{recentChange.comments}</span>
				</p>
			</div>
		{/each}
	</div>
</section>
