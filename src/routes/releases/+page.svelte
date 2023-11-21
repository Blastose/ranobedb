<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbShell from '$lib/components/layout/db/DBShell.svelte';

	export let data;
</script>

<PageTitle title="Releases" />

<DbShell
	name="releases"
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	results={data.count}
>
	<svelte:fragment slot="display">
		<div>
			{#each data.releases as release (release.id)}
				<a href="/release/{release.id}">{release.title}</a>
				<p>{release.release_date}</p>
			{/each}
		</div>
	</svelte:fragment>
</DbShell>
