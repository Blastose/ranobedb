<script lang="ts">
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import DisplayBoxContainer from '$lib/components/layout/db/DisplayBoxContainer.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';

	let { data } = $props();
</script>

<PageTitle title="Users" />
<NoIndex />

<DbShell
	name="users"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by username"
>
	{#snippet display()}
		<DisplayBoxContainer>
			{#each data.users as user (user.id_numeric)}
				<LinkBox href="/user/{user.id_numeric}">{user.username}</LinkBox>
			{/each}
		</DisplayBoxContainer>
	{/snippet}
</DbShell>
