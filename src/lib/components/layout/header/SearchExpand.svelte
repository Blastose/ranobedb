<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { buildImageUrl } from '$lib/components/book/book';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { clickOutside } from '$lib/utils/actions';
	import { search } from '$lib/components/layout/header/search.js';
	import { fly } from 'svelte/transition';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';

	let debounceTimer: ReturnType<typeof setTimeout>;
	let loading = $state(false);
	let focus_state: 'active' | 'not-active' = $state('not-active');

	const debounce = (callback: () => void) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(callback, 550);
	};

	let inputValue: string = $state('');
	let items: Awaited<ReturnType<typeof search>> | undefined = $state(undefined);

	function handleInputChange() {
		loading = true;
		if (!inputValue) {
			items = undefined;
			loading = false;
		} else {
			debounce(async () => {
				if (inputValue) {
					const res = await search(inputValue);
					items = res;
					loading = false;
				}
			});
		}
	}

	function clearInput() {
		inputValue = '';
		items = undefined;
		loading = false;
		focus_state = 'not-active';
	}

	onNavigate(() => {
		focus_state = 'not-active';
	});
</script>

<div
	class="search-input-container"
	use:clickOutside
	onoutclick={() => {
		focus_state = 'not-active';
	}}
>
	<input
		name="q"
		type="text"
		class="input search-input"
		aria-label={'Search'}
		placeholder="Search"
		autocomplete="off"
		bind:value={inputValue}
		oninput={handleInputChange}
		onfocus={() => {
			focus_state = 'active';
		}}
	/>
	<div class="search-icon pointer-events-none">
		<Icon name="search" />
	</div>
	{#if inputValue}
		<button class="absolute top-0 right-0 p-2" aria-label="Clear input" onclick={clearInput}>
			<Icon name="close"></Icon>
		</button>
	{/if}
	{#if focus_state === 'active' && inputValue}
		<div class="results-display thin-scrollbar" transition:fly={{ duration: 150, y: -10 }}>
			<div class="flex flex-col gap-4">
				{#if !loading && items}
					{#if items.books.books.length > 0}
						<div class="flex flex-col gap-2">
							<div class="flex justify-between">
								<p class="text-lg font-bold">Books ({items.books.count})</p>
								<a href="/books?q={encodeURIComponent(inputValue)}" class="link">View all</a>
							</div>
							{#each items.books.books as book}
								{@const imageUrl = buildImageUrl(book.image?.filename)}
								<a href="/book/{book.id}" class="results-item">
									{#if book.image}
										{#key book.image.id}
											<img
												width={book.image.width}
												height={book.image.height}
												class="max-w-[48px] sm:max-w-[56px] h-fit rounded-md shadow-sm"
												src={imageUrl}
												alt=""
												loading="lazy"
											/>
										{/key}
									{/if}
									<div class="flex flex-col text-sm sm:text-base">
										<p class="font-bold line-clamp-2">
											<TitleDisplay obj={book} />
										</p>
										<p>{new DateNumber(book.c_release_date).getDateFormatted()}</p>
									</div>
								</a>
							{/each}
						</div>
					{/if}
					{#if items.series.series.length > 0}
						<div class="flex flex-col gap-2">
							<div class="flex justify-between">
								<p class="text-lg font-bold">Series ({items.series.count})</p>
								<a href="/series?q={encodeURIComponent(inputValue)}" class="link">View all</a>
							</div>
							{#each items.series.series as series}
								{@const imageUrl = buildImageUrl(series.book?.image?.filename)}
								<a href="/series/{series.id}" class="results-item">
									{#if series.book?.image}
										{#key series.book.image.id}
											<img
												width={series.book.image.width}
												height={series.book.image.height}
												class="max-w-[48px] sm:max-w-[56px] h-fit rounded-md shadow-sm"
												src={imageUrl}
												alt=""
												loading="lazy"
											/>
										{/key}
									{/if}
									<div class="flex flex-col text-sm sm:text-base">
										<p class="font-bold line-clamp-2">
											<TitleDisplay obj={series} />
										</p>
										<p>{series.c_num_books} books</p>
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
								{@const imageUrl = buildImageUrl(release.image?.filename)}
								<a href="/release/{release.id}" class="results-item">
									{#if release.image}
										{#key release.image.id}
											<img
												width={release.image.width}
												height={release.image.height}
												class="max-w-[48px] sm:max-w-[56px] h-fit rounded-md shadow-sm"
												src={imageUrl}
												alt=""
												loading="lazy"
											/>
										{/key}
									{/if}
									<div class="flex flex-col text-sm sm:text-base">
										<p class="font-bold line-clamp-2">
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
										<p class="font-bold line-clamp-2">
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
										<p class="font-bold line-clamp-2">
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
					<p class="flex gap-2 items-center">
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
		max-width: 36rem;
	}

	.input.search-input {
		width: 100%;
		max-width: 96px;
		padding-left: 2.5rem;
		padding-right: 2.5rem;
	}

	@media (min-width: 380px) {
		.input.search-input {
			max-width: 156px;
		}
	}

	@media (min-width: 500px) {
		.input.search-input {
			max-width: 100%;
		}
	}

	.search-icon {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
	}
</style>
