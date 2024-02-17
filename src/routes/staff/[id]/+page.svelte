<script lang="ts">
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';

	export let data;

	$: staff = data.staff;
</script>

<DbRouteShell theme={$themeStore ?? data.theme} imageBgStyle={null}>
	<p class="font-medium opacity-80">Staff</p>
	<h1 class="text-2xl font-bold">{staff.name}</h1>

	<h2 class="text-lg font-bold">Books</h2>
	{#each staff.books as book}
		<p><a href="/book/{book.id}">{book.titles.at(0)?.title} - {book.role_type}</a></p>
	{/each}
</DbRouteShell>
