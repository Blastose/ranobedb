<script lang="ts">
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: pageTitle = data.isMyList ? 'My list' : `${data.listUser.username}'s list`;
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<main class="container-rndb">
	{#each data.releases as release}
		<p>{release.title} - {release.format} - {release.lang}</p>
	{/each}
</main>
