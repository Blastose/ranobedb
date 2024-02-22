<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: changes = data.changes;
	$: book = data.book;

	$: title = `Edit history of ${book.title ?? book.title_orig ?? ''}`;
</script>

<PageTitle {title} />

<div class="container-rndb flex flex-col gap-4">
	<h1 class="font-semibold text-2xl">{title}</h1>

	<div class="grid overflow-x-auto">
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
				{#each changes as change}
					<tr>
						<td
							><a class="link" href="/book/{change.item_id}/revision/{change.revision}"
								>b{change.item_id}.{change.revision}</a
							></td
						>
						<td>{new Date(change.added).toLocaleString()}</td>
						<td><a class="link" href="/user/{change.username}">{change.username}</a></td>
						<td class="w-full">{change.comments}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	table {
		white-space: nowrap;
	}

	th {
		text-align: left;
	}

	th,
	td {
		padding: 0 15px;
	}
</style>
