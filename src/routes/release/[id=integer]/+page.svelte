<script lang="ts">
	export let data;

	$: release = data.release;
</script>

<main class="container-rndb">
	<p>Release</p>
	<h1 class="text-2xl font-bold">{release.title}</h1>
	{#if release.romaji}
		<h2 class="text-lg font-bold">{release.romaji}</h2>
	{/if}

	<div>
		<p>Format: {release.format}</p>
		<p>Released: {release.release_date}</p>
	</div>

	<div>
		<h2 class="text-lg font-bold">Publishers</h2>
		<div>
			{#each release.publishers as publisher}
				<p><a href="/publisher/{publisher.id}">{publisher.name} - {publisher.publisher_type}</a></p>
			{/each}
		</div>
	</div>

	<div>
		<h2 class="text-lg font-bold">Book relations</h2>
		<div>
			{#each release.books as book}
				<a href="/book/{book.id}">{book.title}</a>
			{/each}
		</div>
	</div>
</main>
