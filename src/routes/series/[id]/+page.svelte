<script lang="ts">
	export let data;
</script>

<main class="container-rndb">
	<div>
		<p>Series</p>
		<h1 class="text-2xl font-bold">{data.series.titles.at(0)?.title}</h1>
	</div>
	<div>
		<h2 class="text-lg font-bold">Books</h2>
		{#each data.series.books as book}
			<p><a href="/book/{book.id}">{book.title}</a></p>
		{/each}
	</div>
</main>
