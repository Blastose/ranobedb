<script>
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
</script>

<PageTitle title="Home" />

<main class="container-rndb">
	<h1 class="font-bold text-4xl">Home</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
	<a href="/books">Books</a>

	{#each { length: 123 } as _}
		<p>dummy content</p>
	{/each}
	<p>End</p>
</main>
