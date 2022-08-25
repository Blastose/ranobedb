<script lang="ts">
	import type Release from '$lib/models/release';
	export let releases: Release[];
</script>

<!-- The container has padding of 32px on both sides so we need to subtract that -->
<!-- Not sure if there is a better way for the table widths to be responsive -->
<div class="overflow-x-auto rounded-sm max-w-[16rem] sm:max-w-lg md:max-w-xl lg:max-w-2xl">
	<table class="table-auto bg-primary-100 w-full whitespace-nowrap">
		<thead class="text-left">
			<tr class="text-white">
				<th>Lang</th>
				<th>Release date</th>
				<th>Format</th>
				<th>ISBN13</th>
				<th>Title</th>
			</tr>
		</thead>
		<tbody>
			{#each releases as release (release.id)}
				<tr>
					<td>{release.lang}</td>
					<td>{release.release_date}</td>
					<td>{release.format}</td>
					<td>{release.isbn13 || 'N/A'}</td>
					<td>{release.name}</td>
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
