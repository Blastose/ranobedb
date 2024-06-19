<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';
	import DisplayBoxContainer from '$lib/components/layout/db/DisplayBoxContainer.svelte';
	import LinkBox from '$lib/components/layout/db/LinkBox.svelte';

	export let data;
</script>

<PageTitle title="Users" />

<DbShell
	name="users"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
	inputPlaceholder="Search by username"
>
	<svelte:fragment slot="display">
		<DisplayBoxContainer>
			{#each data.users as user (user.id_numeric)}
				<LinkBox href="/user/{user.id_numeric}">{user.username}</LinkBox>
			{/each}
		</DisplayBoxContainer>
	</svelte:fragment>
</DbShell>
