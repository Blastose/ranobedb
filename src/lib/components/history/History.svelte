<script lang="ts">
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import { buildRevisionLink, getHistoryEntryTitle } from '$lib/db/revision';
	import { getDisplayPrefsContext } from '$lib/display/prefs';
	import type { Change } from '$lib/server/db/change/change';

	export let changes: Change[];
	export let title: string | undefined = undefined;
	export let showItemTitle: boolean;

	const displayPrefs = getDisplayPrefsContext();
</script>

<div class="flex flex-col gap-4">
	{#if title}
		<h1 class="table-title">{title}</h1>
	{/if}

	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>Revision</th>
					<th>Date</th>
					<th>User</th>
					<th>Edit summary</th>
				</tr>
			</thead>

			<tbody>
				{#each changes as change (change.id)}
					{@const link = buildRevisionLink(change.item_name, change.item_id, change.revision)}
					<tr>
						<td><a class="link" href={link.href}>{link.text}</a></td>
						<td class="table-date">{new Date(change.added).toLocaleString()}</td>
						<td><a class="link" href="/user/{change.username}">{change.username}</a></td>
						<td class="table-summary"
							>{#if showItemTitle}<a class="link" href={link.href}
									>{getHistoryEntryTitle(change, $displayPrefs)}</a
								>{/if}<MarkdownToHtml markdown={change.comments} type="singleline" /></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.table-title {
		font-weight: 600;
		font-size: 1.5rem;
		line-height: 2rem;
	}

	.table-container {
		display: grid;
		overflow-x: auto;
	}

	.table-date {
		min-width: 165px;
	}

	.table-summary {
		min-width: 256px;
		width: 100%;
	}

	table {
		word-wrap: normal;
	}

	th {
		text-align: left;
	}

	th,
	td {
		padding: 5px 15px;
	}

	tbody tr:nth-child(odd) {
		background-color: rgb(233, 233, 240);
	}

	:global(.dark) tbody tr:nth-child(odd) {
		background-color: #343335;
	}
</style>
