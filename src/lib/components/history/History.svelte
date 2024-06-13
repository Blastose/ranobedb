<script lang="ts">
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import type { Change } from '$lib/server/db/change/change';
	import type { DbItem } from '$lib/server/db/dbTypes';

	export let changes: Change[];
	export let title: string | undefined = undefined;
	export let prefix: string;
	export let dbItem: DbItem;

	function buildRevisionLink(item_id: number, revision: number) {
		return `/${dbItem}/${item_id}/revision/${revision}`;
	}
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
				{#each changes as change (change.revision)}
					<tr>
						<td
							><a class="link" href={buildRevisionLink(change.item_id, change.revision)}
								>{prefix}{change.item_id}.{change.revision}</a
							></td
						>
						<td class="table-date">{new Date(change.added).toLocaleString()}</td>
						<td><a class="link" href="/user/{change.username}">{change.username}</a></td>
						<td class="table-summary"
							><MarkdownToHtml markdown={change.comments} type="singleline" /></td
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
