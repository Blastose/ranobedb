<script lang="ts">
	import ListTabs from '$lib/components/layout/list/ListTabs.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: pageTitle = data.isMyList ? 'My series list' : `${data.listUser.username}'s series list`;
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<main class="container-rndb flex flex-col gap-4">
	<h1 class="text-4xl font-bold">{pageTitle}</h1>

	<ListTabs userIdNum={data.listUser.id_numeric} />

	<a class="link" href="/user/{data.listUser.id_numeric}/list/series/upcoming">Upcoming</a>

	<div>
		{#each data.user_list_series as series}
			<div>
				<p>{series.title}</p>
			</div>
		{/each}
	</div>
</main>
