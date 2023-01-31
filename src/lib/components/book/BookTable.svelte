<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import { convertDate } from '$lib/util/convertDate';

	interface BookTableType extends BookInfo {
		added_date?: Date;
		finish_date?: string;
		start_date?: string;
		label_name?: string;
	}
	export let books: BookTableType[];
	export let extended: boolean = false;
</script>

<div class="grid grid-cols-1 overflow-x-auto">
	<table class="whitespace-nowrap overflow-hidden text-sm">
		<thead>
			<tr>
				<th class="title-head">Title</th>
				{#if extended}
					<th>Label</th>
					<th>Added Date</th>
					<th>Start Date</th>
					<th>Finish Date</th>
				{:else}
					<th>Released</th>
				{/if}
			</tr>
		</thead>

		<tbody>
			{#each books as book (book.id)}
				<tr>
					<td class="title"><a href="/book/{book.id}">{book.title}</a></td>
					{#if extended}
						<td>{book.label_name ?? '--'}</td>
						<td>{convertDate(book.added_date)}</td>
						<td>{book.start_date ?? '--'}</td>
						<td>{book.finish_date ?? '--'}</td>
					{:else}
						<td>{book.release_date}</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	table th {
		background-color: var(--primary-200);
		padding: 0.5rem;
		font-size: 1rem;
		line-height: 1.5rem;
	}

	:global(.dark) table th {
		background-color: var(--dark-400);
	}

	table th:first-child {
		border-radius: 5px 0 0 5px;
	}

	table th:last-child {
		border-radius: 0 5px 5px 0;
	}

	td:not(.title) {
		text-align: center;
	}

	.title-head {
		text-align: left;
	}

	td:not(.title) {
		padding: 0 0.75rem;
	}

	td {
		padding: 0.75rem 0.5rem;
		border-bottom-width: 1px;
		border-color: var(--primary-400);
	}

	tbody > tr:hover {
		background-color: var(--primary-100);
		transition-duration: 150ms;
	}

	:global(.dark) tbody > tr:hover {
		background-color: var(--dark-500);
	}

	:global(.dark) td {
		border-color: var(--dark-400);
	}
</style>
