<script lang="ts">
	import { debounce } from '$lib/util/debounce';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Dropdown from '$lib/components/search-dropdown/Dropdown.svelte';
	import { clickOutside } from '$lib/util/clickOutside';

	export let placeholder = '';
	export let fetchUrl: string;
	export let onClick: (item: { id: number; name: string }) => void;
	export let searchId: string;

	// We cannot bind to input element value with bind:value since the input changes too slow;
	// The search fires for the previous input instead of after the input is completed
	let input = '';
	let results: { id: number; name: string }[] = [];
	let loading = false;
	let inputElement: HTMLInputElement;

	const onClickHideResults = (item: { id: number; name: string }) => {
		onClick(item);
		results = [];
		input = '';
		inputElement.value = input;
	};

	const loadFetchData = async (searchTerm: string) => {
		const response = await fetch(`${fetchUrl}${searchTerm}`);
		results = await response.json();
		loading = false;
	};

	const debounceLoadFetchData = debounce(async () => {
		await loadFetchData(input);
	}, 500);

	const dummyNode = null;
</script>

<div
	class="search-container"
	use:clickOutside={dummyNode}
	on:outclick={() => {
		results = [];
	}}
>
	<div class="search-label">
		<label for={searchId}>Search:</label>
	</div>
	<div class="search-box">
		<input
			autocomplete="off"
			bind:this={inputElement}
			on:focus={async (e) => {
				if (e.currentTarget?.value) {
					loading = true;
					debounceLoadFetchData();
				}
			}}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
				}
			}}
			on:input={async (e) => {
				input = e.currentTarget?.value;
				loading = true;
				debounceLoadFetchData();
			}}
			id={searchId}
			class="input"
			type="text"
			{placeholder}
		/>
	</div>
	<div class="loading-spinner">
		{#if loading}
			<Icon class="animate-spin" height="24" width="24" name="loading" />
		{/if}
	</div>
	<div class="results">
		<Dropdown items={results} onClick={onClickHideResults} />
	</div>
</div>

<style>
	.search-container {
		display: grid;
		column-gap: 0.5rem;
		row-gap: 0.25rem;
		grid-template-areas:
			'search-label fill'
			'search-box loading-spinner'
			'results fill2';
	}

	@media (min-width: 380px) {
		.search-container {
			grid-template-areas:
				'search-label search-box loading-spinner'
				'fill results fill2';
		}
	}

	.search-label {
		align-self: center;
		grid-area: search-label;
	}

	.results {
		grid-area: results;
	}

	.search-box {
		grid-area: search-box;
	}

	.loading-spinner {
		align-self: center;
		grid-area: loading-spinner;
	}
</style>
