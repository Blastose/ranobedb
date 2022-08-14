<script lang="ts">
	import type BookInfo from '$lib/models/bookInfo';
	export let books: BookInfo[];
</script>

<div>
	<table class="table-auto">
		<thead class="text-left">
			<tr>
				<th class="w-3/4">Title</th>
				<th>Volume</th>
				<th>Release date</th>
			</tr>
		</thead>
		<tbody>
			{#each books as book (book.id)}
				<tr>
					<td>
						<a href="/book/{book.id}" sveltekit:prefetch>
							{book.title}
						</a>
					</td>
					<td>{book.volume}</td>
					<td>{book.release_date}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
