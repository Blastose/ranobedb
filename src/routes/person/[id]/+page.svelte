<script lang="ts">
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';

	export let data;

	$: person = data.person;
</script>

<DbRouteShell theme={$themeStore ?? data.theme} imageBgStyle={null}>
	<p class="font-medium opacity-80">Person</p>
	<h1 class="text-2xl font-bold">{person.name}</h1>

	<h2 class="text-lg font-bold">Books</h2>
	{#each person.books as book}
		<p><a href="/book/{book.id}">{book.titles.at(0)?.title} - {book.role_type}</a></p>
	{/each}
</DbRouteShell>
