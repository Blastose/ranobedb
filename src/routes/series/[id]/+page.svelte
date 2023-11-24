<script lang="ts">
	export let data;
</script>

<main class="container-rndb">
	<div>
		<h1>{data.series.titles.at(0)?.title}</h1>
	</div>
	<div>
		<h2>Books</h2>
		{#each data.series.books as book}
			<p>{book.title}</p>
		{/each}
	</div>
</main>
