<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	let { data } = $props();

	let pageTitle = $derived(
		data.isMyList ? 'My staff list' : `${data.listUser.username}'s staff list`,
	);
</script>

<PageTitle title={pageTitle} />
<NoIndex />

<main>
	{#each data.followedStaff as staff (staff.id)}
		<div><a class="link" href="/staff/{staff.id}"><NameDisplay obj={staff}></NameDisplay></a></div>
	{/each}
</main>
