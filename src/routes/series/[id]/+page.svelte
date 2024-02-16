<script lang="ts">
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';

	export let data;
</script>

<DbRouteShell theme={$themeStore ?? data.theme} imageBgStyle={null}>
	<p>Series</p>
	<h1 class="text-2xl font-bold">{data.series.titles.at(0)?.title}</h1>

	<h2>Publication status</h2>
	<p>{data.series.publication_status}</p>

	<div>
		<h2 class="text-lg font-bold">Books</h2>
		{#each data.series.books as book}
			<p><a href="/book/{book.id}">{book.title}</a></p>
		{/each}
	</div>
</DbRouteShell>
