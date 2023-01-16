<script lang="ts">
	import { page } from '$app/stores';

	export let totalPages: number;

	$: currentPage = Number($page.url.searchParams.get('page') ?? '1');

	const createPaginationUrl = (pageNumber: number) => {
		const newUrl = new URL($page.url);
		newUrl.searchParams.set('page', String(pageNumber));
		return `${newUrl.pathname}${newUrl.search}`;
	};
</script>

{totalPages}
{currentPage}
<div class="flex gap-1 flex-wrap">
	{#each { length: totalPages } as _, p}
		<!-- {#if p <= currentPage + 3 || p >= currentPage - 3} -->
		<a
			class="pagination-button"
			class:active={currentPage === p + 1}
			href={createPaginationUrl(p + 1)}
		>
			{p + 1}
		</a>
		<!-- {/if} -->
	{/each}
</div>

<style>
	.pagination-button {
		color: black;
		background-color: var(--primary-400);
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		transition-duration: 150ms;
	}

	.pagination-button.active {
		color: white;
		background-color: var(--primary-500);
	}

	.pagination-button:hover {
		color: white;
		background-color: var(--primary-700);
	}
</style>
