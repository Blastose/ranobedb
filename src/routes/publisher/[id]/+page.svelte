<script lang="ts">
	export let data;

	$: publisher = data.publisher;
</script>

<main class="container-rndb">
	<p>Publisher</p>
	<h1 class="text-2xl font-bold">{publisher.name}</h1>

	<h2 class="text-lg font-bold">Releases</h2>
	{#each publisher.releases as release}
		<p><a href="/release/{release.id}">{release.title} - {release.release_date}</a></p>
	{/each}
</main>
