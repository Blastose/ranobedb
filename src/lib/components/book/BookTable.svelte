<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import { convertDate } from '$lib/util/convertDate';

	interface BookTableType extends BookInfo {
		added_date?: Date;
		finish_date?: Date;
		start_date?: Date;
		label_name?: string;
	}
	export let books: BookTableType[];
	export let extended: boolean = false;
</script>

<div class="grid grid-cols-1 overflow-x-auto">
	<table class="whitespace-nowrap  overflow-hidden text-sm">
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
						<td>{book.label_name ?? 'N/A'}</td>
						<td>{convertDate(book.added_date)}</td>
						<td>{convertDate(book.start_date)}</td>
						<td>{convertDate(book.finish_date)}</td>
					{:else}
						<td>{convertDate(book.release_date)}</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	td:not(.title) {
		text-align: center;
	}

	.title-head {
		text-align: left;
	}

	td:not(.title) {
		padding: 0 0.75rem;
	}
</style>
