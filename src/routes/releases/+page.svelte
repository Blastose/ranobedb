<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import { page } from '$app/stores';

	export let data;
</script>

<PageTitle title="Releases" />

<main class="container-rndb flex flex-col gap-4">
	<div class="asdf">
		<h1 class="font-bold text-4xl">Browse releases</h1>

		<div>
			<input type="text" class="input w-full max-w-xl" placeholder="Search" />
		</div>

		<Pagination
			url={$page.url}
			currentPage={data.currentPage}
			totalPages={data.totalPages}
			siblingCount={1}
		/>
	</div>
	<div>
		{#each data.releases as release (release.id)}
			<a href="/release/{release.id}">{release.title}</a>
			<p>{release.release_date}</p>
		{/each}
	</div>

	<div>
		<Pagination
			url={$page.url}
			currentPage={data.currentPage}
			totalPages={data.totalPages}
			siblingCount={1}
		/>
	</div>
</main>

<style>
	.asdf {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		view-transition-name: db-head-page;
	}
</style>
