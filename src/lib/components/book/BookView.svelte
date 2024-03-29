<script lang="ts">
	import type { BookInfo } from '$lib/types/dbTypes';
	import Icon, { type IconType } from '$lib/components/icon/Icon.svelte';

	import BookCardContainer from '$lib/components/book/book-card/BookCardContainer.svelte';
	import BookImageContainer from '$lib/components/book/book-image/BookImageContainer.svelte';
	import bookViewIndex from '$lib/stores/bookViewIndex';
	import BookTable from './BookTable.svelte';

	export let books: BookInfo[];
	export let extended = false;
	export let numberOfBooks = books.length;

	let tabs = [
		{ name: 'table', icon: 'table' as IconType, ariaName: 'Switch to table view' },
		{ name: 'card', icon: 'viewList' as IconType, ariaName: 'Switch to card view' },
		{ name: 'image', icon: 'viewComfy' as IconType, ariaName: 'Switch to image view' }
	];

	$: activeItem = tabs[$bookViewIndex].name;
</script>

<div class="flex flex-col gap-4">
	<div class="flex justify-between items-center">
		<p class="font-semibold">{numberOfBooks} Books</p>
		<div class="tab-container">
			<div class="highlight" style="left: {40 * $bookViewIndex}px;" />

			{#each tabs as tab, i}
				<button
					aria-label={tab.ariaName}
					class="tab {$bookViewIndex === i ? 'active' : ''}"
					type="button"
					on:click={() => {
						bookViewIndex.set(i);
					}}
				>
					<Icon height="24" width="24" name={tab.icon} />
				</button>
			{/each}
		</div>
	</div>

	<div>
		{#if activeItem === 'card'}
			<BookCardContainer {books} />
		{:else if activeItem === 'image'}
			<BookImageContainer {books} />
		{:else if activeItem === 'table'}
			<BookTable {books} {extended} />
		{/if}
	</div>
</div>

<style>
	.tab-container {
		display: flex;
		position: relative;
		background-color: var(--primary-200);
	}

	:global(.dark) .tab-container {
		background-color: var(--dark-200);
	}

	.highlight {
		position: absolute;
		transition-duration: 150ms;
		background-color: var(--primary-500);
		height: 40px;
		width: 40px;
	}

	.tab {
		position: relative;
		font-size: 600;
		transition-duration: 150ms;
		padding: 0.5rem;
	}

	.tab:not(.active):hover {
		background-color: var(--primary-300);
	}

	:global(.dark) .tab:not(.active):hover {
		background-color: var(--dark-500);
	}

	.tab.active {
		color: white;
	}
</style>
