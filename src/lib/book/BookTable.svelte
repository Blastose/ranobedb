<script lang="ts">
	import type BookInfo from '$lib/models/bookInfo';
	export let books: BookInfo[];
</script>

<div>
	<table class="table-auto bg-[#e4e7ee] w-full">
		<thead class="text-left">
			<tr class="text-white">
				<th class="w-3/4">Title</th>
				<th>Volume</th>
				<th>Release date</th>
			</tr>
		</thead>
		<tbody class="text-black">
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

<style>
	tr > th {
		background-color: #73739c;
		padding: 0.5rem 1rem;
	}
	tr > td {
		padding: 0.25rem 1rem;
	}
	tr:nth-child(even) {
		background-color: #d4d8e2;
	}
	tr:hover {
		background-color: #cbcddd;
	}
</style>
