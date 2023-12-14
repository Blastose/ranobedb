<script lang="ts">
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import { themeStore } from '$lib/stores/themeStore';

	export let data;

	$: publisher = data.publisher;
</script>

<DbRouteShell theme={$themeStore ?? data.theme} imageBgStyle={null}>
	<p>Publisher</p>
	<h1 class="text-2xl font-bold">{publisher.name}</h1>

	<h2 class="text-lg font-bold">Releases</h2>
	{#each publisher.releases as release}
		<p><a href="/release/{release.id}">{release.title} - {release.release_date}</a></p>
	{/each}
</DbRouteShell>
