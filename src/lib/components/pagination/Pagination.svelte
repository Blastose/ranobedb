<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '$lib/components/icon/Icon.svelte';

	export let totalPages: number;

	$: currentPage = Number($page.url.searchParams.get('page') ?? '1');

	const createPaginationUrl = (pageNumber: number) => {
		const newUrl = new URL($page.url);
		if (pageNumber < 1) {
			pageNumber = 1;
		} else if (pageNumber > totalPages) {
			pageNumber = totalPages;
		}
		newUrl.searchParams.set('page', String(pageNumber));
		return `${newUrl.pathname}${newUrl.search}`;
	};

	const inRange = (number: number, currentPage: number) => {
		return (
			number <= currentPage + MAX_BUTTONS_LEFT_RIGHT &&
			number >= currentPage - MAX_BUTTONS_LEFT_RIGHT
		);
	};

	const MAX_BUTTONS_LEFT_RIGHT = 2;
</script>

{#key $page.url}
	<nav class="pagination-container">
		<a
			aria-label="Pagination back"
			class="arrow-button"
			class:disabled={currentPage === 1}
			href={createPaginationUrl(currentPage - 1)}
		>
			<Icon height="24" width="24" name="chevronLeft" />
		</a>
		{#if !inRange(1, currentPage)}
			<a class="pagination-button" href={createPaginationUrl(1)}>
				{1}
			</a>
			{#if currentPage - MAX_BUTTONS_LEFT_RIGHT - 1 !== 1}
				<div><Icon height="24" width="24" name="dotsHorizontal" /></div>
			{/if}
		{/if}
		{#each { length: totalPages } as _, p}
			{#if inRange(p + 1, currentPage)}
				<a
					class="pagination-button"
					class:active={currentPage === p + 1}
					href={createPaginationUrl(p + 1)}
				>
					{p + 1}
				</a>
			{/if}
		{/each}
		{#if !inRange(totalPages, currentPage)}
			{#if currentPage + MAX_BUTTONS_LEFT_RIGHT + 1 !== totalPages}
				<div><Icon height="24" width="24" name="dotsHorizontal" /></div>
			{/if}
			<a class="pagination-button" href={createPaginationUrl(totalPages)}>
				{totalPages}
			</a>
		{/if}

		<a
			aria-label="Pagination forward"
			class="arrow-button"
			class:disabled={currentPage === totalPages || totalPages === 0}
			href={createPaginationUrl(currentPage + 1)}
		>
			<Icon height="24" width="24" name="chevronRight" />
		</a>
	</nav>
{/key}

<style>
	.pagination-container {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
	}

	.pagination-button {
		color: black;
		background-color: var(--primary-300);
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		transition-duration: 300ms;
	}

	.arrow-button {
		color: black;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition-duration: 300ms;
		background-color: var(--primary-300);
	}
	.arrow-button.disabled {
		color: rgb(192, 192, 192);
		cursor: default;
		pointer-events: none;
		background-color: #e6e7eb;
	}

	:global(.dark) .arrow-button.disabled {
		color: gray;
		background-color: rgb(75, 74, 77);
	}

	.pagination-button.active {
		color: white;
		background-color: var(--primary-500);
	}

	.arrow-button:hover,
	.pagination-button:hover {
		color: white;
		background-color: var(--primary-600);
	}
</style>
