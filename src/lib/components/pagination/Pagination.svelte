<script lang="ts">
	import Icon from '$lib/components/icon/Icon.svelte';

	export let currentPage: number;
	export let totalPages: number;
	export let siblingCount: number = 1;
	export let url: URL;

	function createPaginationUrl(page: number | undefined, url: URL) {
		page = page ?? 0;
		const newUrl = new URL(url);
		if (page < 1) {
			page = 1;
		} else if (page > totalPages && totalPages !== 0) {
			page = totalPages;
		}
		newUrl.searchParams.set('page', String(page));
		return `${newUrl.pathname}${newUrl.search}`;
	}

	// From https://github.com/melt-ui/melt-ui/blob/ce5054a90eabd06dc3f964a15dbc571905d9cc1e/src/lib/builders/pagination/helpers.ts
	function getPageItems(page: number, totalPages: number, siblingCount: number) {
		type PageItem = { type: 'ellipsis' | 'page'; value?: number; key: string };
		const pageItems: Array<PageItem> = [];
		const pagesToShow = new Set([1, totalPages]);
		const firstItemWithSiblings = 3 + siblingCount;
		const lastItemWithSiblings = totalPages - 2 - siblingCount;

		if (firstItemWithSiblings > lastItemWithSiblings) {
			for (let p = 2; p <= totalPages - 1; p++) {
				pagesToShow.add(p);
			}
		} else if (page < firstItemWithSiblings) {
			for (let p = 2; p <= Math.min(firstItemWithSiblings, totalPages); p++) {
				pagesToShow.add(p);
			}
		} else if (page > lastItemWithSiblings) {
			for (let p = totalPages - 1; p >= Math.max(lastItemWithSiblings, 2); p--) {
				pagesToShow.add(p);
			}
		} else {
			for (
				let p = Math.max(page - siblingCount, 2);
				p <= Math.min(page + siblingCount, totalPages);
				p++
			) {
				pagesToShow.add(p);
			}
		}

		const addPage = (value: number) => {
			pageItems.push({ type: 'page', value, key: `page-${value}` });
		};
		const addEllipsis = () => {
			pageItems.push({ type: 'ellipsis', key: `ellipsis-${pageItems.length}` });
		};

		let lastNumber = 0;
		for (const page of Array.from(pagesToShow).sort((a, b) => a - b)) {
			if (page - lastNumber > 1) {
				addEllipsis();
			}
			addPage(page);
			lastNumber = page;
		}

		return pageItems;
	}

	function leftDisabled(currentPage: number) {
		return currentPage === 1;
	}

	function rightDisabled(currentPage: number, totalPages: number) {
		return currentPage === totalPages;
	}

	$: pageItems = getPageItems(currentPage, totalPages, siblingCount);
	$: isPreviousDisabled = leftDisabled(currentPage);
	$: isNextDisabled = rightDisabled(currentPage, totalPages) || totalPages === 0;
</script>

{#if currentPage > 0}
	<nav class="pagination-container">
		<div class="flex gap-2 flex-wrap">
			{#if isPreviousDisabled}
				<button
					aria-label="Previous"
					disabled
					class:disabled={isPreviousDisabled}
					class="arrow-button"
				>
					<Icon name="chevronLeft" />
				</button>
			{:else}
				<a
					class="arrow-button"
					href={createPaginationUrl(currentPage - 1, url)}
					aria-label="Previous"
				>
					<Icon name="chevronLeft" />
				</a>
			{/if}
			{#each pageItems as page (page.key)}
				{#if page.type === 'ellipsis'}
					<span class="flex items-end"><Icon name="dotsHorizontal" /></span>
				{:else if page.value !== 0}
					<a
						class:active={currentPage === page.value}
						class="pagination-button"
						href={createPaginationUrl(page.value, url)}>{page.value}</a
					>
				{/if}
			{/each}
			{#if isNextDisabled}
				<button aria-label="Next" disabled class:disabled={isNextDisabled} class="arrow-button">
					<Icon name="chevronRight" />
				</button>
			{:else}
				<a class="arrow-button" href={createPaginationUrl(currentPage + 1, url)} aria-label="Next">
					<Icon name="chevronRight" />
				</a>
			{/if}
		</div>
	</nav>
{/if}

<style>
	.pagination-container {
		display: flex;
		gap: 0.25rem;
		flex-direction: column;
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

	:global(.dark) .pagination-button {
		color: white;
		background-color: var(--dark-200);
	}

	.arrow-button {
		color: black;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition-duration: 300ms;
		background-color: var(--primary-300);
	}

	:global(.dark) .arrow-button {
		color: white;
		background-color: var(--dark-200);
	}

	.arrow-button.disabled {
		color: rgb(192, 192, 192);
		background-color: #e6e7eb;
		cursor: not-allowed;
	}

	:global(.dark) .arrow-button.disabled {
		color: rgb(71, 70, 71);
		background-color: rgb(53, 52, 54);
	}

	.pagination-button.active {
		color: white;
		background-color: var(--primary-500);
	}

	.arrow-button:hover:not(.disabled),
	.pagination-button:hover:not(.active) {
		color: white;
		background-color: var(--primary-450);
	}

	:global(.dark) .arrow-button:hover:not(.disabled),
	:global(.dark) .pagination-button:hover:not(.active) {
		background-color: var(--dark-400);
	}
</style>
