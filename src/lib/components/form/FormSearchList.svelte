<script lang="ts">
	import SearchDropdown from '$lib/components/search-dropdown/SearchDropdown.svelte';
	import FormSearchListDropdown from '$lib/components/form/FormSearchListDropdown.svelte';

	export let headerName: string;
	export let items: { id: number; name: string }[];
	export let fetchUrl: string;
	export let searchPlaceholder: string;
	export let formItemName: string;
	export let error = '';
	export let searchId: string;

	export let dropdown: { itemAttribute: string; dropdownValues: readonly string[] } | null = null;

	export let onSearchItemClick: (item: { id: number; name: string }) => void;

	const removeFromItems = (index: number) => {
		if (items) {
			items.splice(index, 1);
			items = items;
		}
	};

	const updateItems = () => {
		if (items) {
			items = items;
		}
	};
</script>

<div class="form-search-list-container">
	<div>
		<h3 class="font-semibold text-lg">{headerName}</h3>
		{#if error}
			<span class="text-red-600 dark:text-red-400">{error}</span>
		{/if}
		<div class="list-container">
			{#each items as item, index (index)}
				<div class="list-item">
					<p>
						<span class="text-sm text-gray-500 dark:text-gray-400">id{item.id}</span>: {item.name}
					</p>

					{#if dropdown}
						<FormSearchListDropdown
							{updateItems}
							{item}
							itemAttribute={dropdown.itemAttribute}
							dropdownValues={dropdown.dropdownValues}
						/>
					{/if}

					<input class="hidden" type="text" name={formItemName} value={JSON.stringify(item)} />
					<button
						class="remove-button"
						on:click={() => {
							removeFromItems(index);
						}}
						type="button">Remove</button
					>
				</div>
			{/each}
		</div>
	</div>
	<SearchDropdown
		{searchId}
		{fetchUrl}
		placeholder={searchPlaceholder}
		onClick={onSearchItemClick}
	/>
</div>

<style>
	.form-search-list-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-start;
	}

	.list-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.list-item {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.remove-button {
		padding: 0.125rem 0.375rem;
		border-radius: 0.375rem;
		background-color: var(--primary-200);
		transition-duration: 150ms;
	}

	.remove-button:hover {
		background-color: var(--primary-300);
	}

	:global(.dark) .remove-button {
		background-color: var(--dark-200);
	}

	:global(.dark) .remove-button:hover {
		background-color: var(--dark-400);
	}
</style>
