<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { clickOutside } from '$lib/utils/actions';
	import { search } from '$lib/components/layout/header/search.js';
	import { fly } from 'svelte/transition';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { onMount } from 'svelte';
	import Cover from '$lib/components/image/Cover.svelte';

	let debounceTimer: ReturnType<typeof setTimeout>;
	let searchController: AbortController | undefined;
	let loading = $state(false);
	let searchFailed = $state(false);
	let isSearchOpen = $state(false);
	let inputValue = $state('');
	let items: Awaited<ReturnType<typeof search>> | undefined = $state(undefined);
	let searchInput: HTMLInputElement;
	let searchSlot: HTMLDivElement;
	let searchLeft = $state(0);

	function updateSearchPosition() {
		searchLeft = searchSlot.getBoundingClientRect().left;
	}

	function openSearch() {
		updateSearchPosition();
		if (!isSearchOpen && inputValue && !items) {
			handleInputChange();
		}
		isSearchOpen = true;
	}

	function closeSearch() {
		isSearchOpen = false;
		cancelSearch();
		loading = false;
	}

	function handleFocusOut(event: FocusEvent) {
		if (event.relatedTarget instanceof Node && !searchSlot.contains(event.relatedTarget)) {
			closeSearch();
		}
	}

	function cancelSearch() {
		clearTimeout(debounceTimer);
		searchController?.abort();
		searchController = undefined;
	}

	function handleInputChange() {
		cancelSearch();
		items = undefined;
		searchFailed = false;
		loading = Boolean(inputValue);
		if (!inputValue) return;

		const term = inputValue;
		const controller = new AbortController();
		searchController = controller;
		debounceTimer = setTimeout(() => {
			void loadResults(term, controller);
		}, 550);
	}

	async function loadResults(term: string, controller: AbortController) {
		try {
			const results = await search(term, controller.signal);
			if (!controller.signal.aborted) {
				items = results;
			}
		} catch {
			if (!controller.signal.aborted) {
				searchFailed = true;
				controller.abort();
			}
		} finally {
			if (searchController === controller) {
				loading = false;
				searchController = undefined;
			}
		}
	}

	function clearInput() {
		inputValue = '';
		handleInputChange();
		isSearchOpen = true;
		searchInput.focus();
	}

	onNavigate(closeSearch);

	onMount(() => {
		updateSearchPosition();
		const searchOnLoad = () => {
			if (searchInput.value || searchInput === document.activeElement) {
				isSearchOpen = true;
				handleInputChange();
			}
		};
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', searchOnLoad);
		} else {
			searchOnLoad();
		}

		return () => {
			document.removeEventListener('DOMContentLoaded', searchOnLoad);
			cancelSearch();
		};
	});
</script>

<svelte:window onresize={updateSearchPosition} />

<div
	class="search-input-slot"
	bind:this={searchSlot}
	class:expanded={isSearchOpen}
	style:--search-left="{searchLeft}px"
	use:clickOutside
	onfocusin={openSearch}
	onfocusout={handleFocusOut}
	onoutclick={closeSearch}
>
	<div class="search-input-container">
		<input
			name="q"
			type="text"
			class="input search-input"
			aria-label={'Search'}
			placeholder="Search"
			autocomplete="off"
			bind:this={searchInput}
			bind:value={inputValue}
			oninput={handleInputChange}
		/>
		<div class="search-icon pointer-events-none">
			<Icon name="search" />
		</div>
		{#if inputValue}
			<button class="absolute right-0 top-0 p-2" aria-label="Clear input" onclick={clearInput}>
				<Icon name="close"></Icon>
			</button>
		{/if}
	</div>
	{#if isSearchOpen && inputValue}
		<div class="results-display thin-scrollbar" transition:fly={{ duration: 150, y: -10 }}>
			<div class="flex flex-col gap-4">
				{#if searchFailed}
					<p>Could not load results. Please try again.</p>
				{:else if !loading && items}
					{#if items.series.series.length > 0}
						<div class="flex flex-col gap-2">
							<div class="flex justify-between">
								<p class="text-lg font-bold">Series ({items.series.count})</p>
								<a href="/series?q={encodeURIComponent(inputValue)}" class="link">View all</a>
							</div>
							{#each items.series.series as series}
								<a href="/series/{series.id}" class="results-item">
									{#if series.book?.image}
										{#key series.book.image.id}
											<div class="w-[48px] shrink-0 sm:w-[56px]">
												<Cover image={series.book.image} />
											</div>
										{/key}
									{/if}
									<div class="flex flex-col text-sm sm:text-base">
										<p class="line-clamp-2 font-bold">
											<TitleDisplay obj={series} />
										</p>
										<p>{series.c_num_books} books</p>
									</div>
								</a>
							{/each}
						</div>
					{/if}
					{#if items.books.books.length > 0}
						<div class="flex flex-col gap-2">
							<div class="flex justify-between">
								<p class="text-lg font-bold">Books ({items.books.count})</p>
								<a href="/books?q={encodeURIComponent(inputValue)}" class="link">View all</a>
							</div>
							{#each items.books.books as book}
								<a href="/book/{book.id}" class="results-item">
									{#if book.image}
										{#key book.image.id}
											<div class="w-[48px] shrink-0 sm:w-[56px]">
												<Cover image={book.image} />
											</div>
										{/key}
									{/if}
									<div class="flex flex-col text-sm sm:text-base">
										<p class="line-clamp-2 font-bold">
											<TitleDisplay obj={book} />
										</p>
										<p>{new DateNumber(book.c_release_date).getDateFormatted()}</p>
									</div>
								</a>
							{/each}
						</div>
					{/if}
					{#if items.releases && items.releases.releases.length === 1}
						<div class="flex flex-col gap-2">
							<div class="flex justify-between">
								<p class="text-lg font-bold">Releases ({items.releases.count})</p>
								<a href="/releases?q={encodeURIComponent(inputValue)}" class="link">View all</a>
							</div>
							{#each items.releases.releases as release}
								<a href="/release/{release.id}" class="results-item">
									{#if release.image}
										{#key release.image.id}
											<div class="w-[48px] shrink-0 sm:w-[56px]">
												<Cover image={release.image} />
											</div>
										{/key}
									{/if}
									<div class="flex flex-col text-sm sm:text-base">
										<p class="line-clamp-2 font-bold">
											<NameDisplay obj={release} />
										</p>
										<p>{new DateNumber(release.release_date).getDateFormatted()}</p>
									</div>
								</a>
							{/each}
						</div>
					{/if}
					{#if items.publishers.publishers.length > 0}
						<div class="flex flex-col gap-2">
							<div class="flex justify-between">
								<p class="text-lg font-bold">Publishers ({items.publishers.count})</p>
								<a href="/publishers?q={encodeURIComponent(inputValue)}" class="link">View all</a>
							</div>
							{#each items.publishers.publishers as publisher}
								<a href="/publisher/{publisher.id}" class="results-item">
									<div class="flex flex-col text-sm sm:text-base">
										<p class="line-clamp-2 font-bold">
											<NameDisplay obj={publisher} />
										</p>
									</div>
								</a>
							{/each}
						</div>
					{/if}
					{#if items.staff.staff.length > 0}
						<div class="flex flex-col gap-2">
							<div class="flex justify-between">
								<p class="text-lg font-bold">Staff ({items.staff.count})</p>
								<a href="/staff?q={encodeURIComponent(inputValue)}" class="link">View all</a>
							</div>
							{#each items.staff.staff as staff}
								<a href="/staff/{staff.id}" class="results-item">
									<div class="flex flex-col text-sm sm:text-base">
										<p class="line-clamp-2 font-bold">
											<NameDisplay obj={staff} />
										</p>
									</div>
								</a>
							{/each}
						</div>
					{/if}
					{#if items.books.books.length + items.series.series.length + items.publishers.publishers.length + items.staff.staff.length + (items.releases?.releases.length || 0) === 0}
						<p>No results found</p>
					{/if}
				{:else}
					<p class="flex items-center gap-2">
						<Icon class="animate-spin" name="loading"></Icon>Loading...
					</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.results-display {
		position: absolute;
		margin-top: 0.5rem;
		background-color: var(--primary-100);
		padding: 0.75rem;
		border-radius: 0.5rem;
		width: calc(100vw - 48px);
		right: -88px;
		max-height: calc(100dvh - 80px);
		overflow-y: auto;
	}

	@media (min-width: 500px) {
		.results-display {
			width: 200%;
			max-width: calc(100vw - 156px);
			right: 0;
		}
	}

	:global(.dark) .results-display {
		background-color: var(--dark-600);
	}

	.results-item {
		display: flex;
		padding: 0.5rem;
		border-radius: 0.375rem;
		gap: 0.5rem;
		background-color: var(--primary-200);
		transition: background-color 300ms;
	}

	:global(.dark) .results-item {
		background-color: var(--bg-dark1);
	}

	.results-item:hover {
		background-color: var(--primary-300);
	}

	:global(.dark) .results-item:hover {
		background-color: var(--dark-400);
	}

	.search-input-container {
		position: relative;
	}

	.search-input-slot {
		position: relative;
		max-width: 36rem;
	}

	.input.search-input {
		width: 100%;
		padding-left: 2.5rem;
		padding-right: 2.5rem;
	}

	@media (max-width: 499px) {
		.search-input-slot {
			/* Reserve space so expansion doesn't move adjacent header controls. */
			width: 96px;
		}

		.search-input-container {
			width: 100%;
			left: 0;
			z-index: 1;
			transition:
				width 150ms ease,
				left 150ms ease;
		}

		.search-input-slot.expanded .search-input-container {
			width: calc(100vw - 2rem);
			left: calc(1rem - var(--search-left));
		}

		.results-display {
			/* Keep the dropdown anchored independently of the input's width animation. */
			width: calc(100vw - 2rem);
			left: calc(1rem - var(--search-left));
			right: auto;
			z-index: 1;
		}
	}

	@media (min-width: 380px) and (max-width: 499px) {
		.search-input-slot {
			width: 156px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.search-input-container {
			transition: none;
		}
	}

	.search-icon {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
	}
</style>
