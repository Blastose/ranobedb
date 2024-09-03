<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { buildImageUrl } from '$lib/components/book/book';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { clickOutside } from '$lib/utils/actions';
	import { search } from '$lib/components/layout/header/search.js';
	import { fly } from 'svelte/transition';
	import TitleDisplay from '$lib/components/display/TitleDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';

	let debounceTimer: ReturnType<typeof setTimeout>;
	let loading = false;
	let state: 'active' | 'not-active' = 'not-active';

	const debounce = (callback: () => void) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(callback, 450);
	};

	let inputElement: HTMLInputElement;
	let items: Awaited<ReturnType<typeof search>> | undefined = undefined;

	function handleInputChange() {
		loading = true;
		debounce(async () => {
			if (!inputElement.value) {
				clearInput();
			} else {
				const res = await search(inputElement.value);
				console.log(res);
				items = res;
				loading = false;
			}
		});
	}

	function clearInput() {
		inputElement.value = '';
		items = undefined;
		loading = false;
	}

	onNavigate(() => {
		state = 'not-active';
	});
</script>

<div
	class="search-input-container"
	use:clickOutside
	on:outclick={() => {
		state = 'not-active';
		console.log('out');
	}}
>
	<input
		name="q"
		type="text"
		class="input search-input"
		aria-label={'Search'}
		placeholder="Search"
		autocomplete="off"
		bind:this={inputElement}
		on:input={handleInputChange}
		on:focus={() => {
			state = 'active';
			console.log('focus on');
		}}
	/>
	<div class="search-icon pointer-events-none">
		<Icon name="search" />
	</div>
	{#if inputElement?.value}
		<button class="absolute top-0 right-0 p-2" aria-label="Clear input" on:click={clearInput}>
			<Icon name="close"></Icon>
		</button>
	{/if}
	{#if state === 'active' && inputElement?.value}
		<div
			class="absolute mt-2 w-full results-display thin-scrollbar"
			transition:fly={{ duration: 150, y: -10 }}
		>
			<div class="flex flex-col gap-4">
				{#if !loading && items}
					{#if items.books.books.length > 0}
						<div class="flex flex-col gap-2">
							<div class="flex justify-between">
								<p class="text-lg font-bold">Books ({items.books.count})</p>
								<a href="/books?q={encodeURIComponent(inputElement?.value)}" class="link"
									>View all</a
								>
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
										<p>{new DateNumber(book.release_date).getDateFormatted()}</p>
									</div>
								</a>
							{/each}
						</div>
					{/if}
					{#if items.series.series.length > 0}
						<div class="flex flex-col gap-2">
							<div class="flex justify-between">
								<p class="text-lg font-bold">Series ({items.series.count})</p>
								<a href="/series?q={encodeURIComponent(inputElement?.value)}" class="link"
									>View all</a
								>
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
					{#if items.books.books.length + items.series.series.length === 0}
						<p>No results found</p>
					{/if}
				{:else}
					<p>Loading...</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.results-display {
		background-color: var(--primary-100);
		padding: 0.75rem;
		border-radius: 0.5rem;
		width: 200%;
		max-width: calc(100vw - 128px);
		right: 0;
		max-height: calc(100dvh - 80px);
		overflow-y: auto;
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
		max-width: 1px;
		max-width: 100%;
		padding-left: 2.5rem;
		padding-right: 2.5rem;
	}

	.search-icon {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
	}
</style>
