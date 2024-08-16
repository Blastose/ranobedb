<script lang="ts" context="module">
	import type { Nullish } from '$lib/server/zod/schema';

	type Rec = { id: number; name: string; romaji?: Nullish<string> };
</script>

<script lang="ts" generics="T extends Rec">
	import NameDisplay from '../display/NameDisplay.svelte';
	import { createCombobox, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import Icon from '../icon/Icon.svelte';

	export let title: string;
	export let handleAdd: (item: T) => void;
	export let search: (input: string) => Promise<T[]>;
	export let selectedItems: Pick<T, 'id'>[];
	export let filterDuplicateIds: boolean;
	export let capitalize: boolean = false;
	export let small: boolean = false;

	const {
		elements: { menu, input, option, label },
		states: { open, inputValue, touchedInput, selected },
		helpers: { isSelected },
	} = createCombobox<T>({
		forceVisible: true,
		preventScroll: false,
	});

	let debounceTimer: ReturnType<typeof setTimeout>;
	let loading = false;

	const debounce = (callback: () => void) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(callback, 450);
	};

	let searchedItems: T[] = [];

	$: {
		if ($touchedInput) {
			loading = true;
			debounce(async () => {
				const json = await search($inputValue);
				searchedItems = json;
				loading = false;
			});
		} else {
			if ($inputValue.length === 0) {
				searchedItems = [];
			}
		}
	}

	$: {
		if ($selected) {
			handleAdd($selected.value);
		}
	}

	$: filteredItems = searchedItems.filter((si) => !selectedItems.some((v) => v.id === si.id));
	$: itemsToDisplay = filterDuplicateIds ? filteredItems : searchedItems;
</script>

<div class="flex flex-col gap-1">
	<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
	<label use:melt={$label}>
		<span>{title}</span>
	</label>

	<div class="relative w-full {small ? 'max-w-xs' : 'max-w-sm'}">
		<div class="absolute left-2 top-1/2 -translate-y-1/2"><Icon name="search" /></div>
		<input
			use:melt={$input}
			class="combobox input w-full !pl-10 !pr-8"
			class:small
			placeholder="Name"
			type="text"
		/>
		<div class="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-magnum-900">
			{#if $open && $inputValue.length > 0}
				<Icon name="chevronUp" />
			{:else}
				<Icon name="chevronDown" />
			{/if}
		</div>
	</div>
</div>
{#if $open && $inputValue.length > 0}
	<ul
		class="z-[99999] flex max-h-[300px] flex-col rounded-lg"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -5 }}
	>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div
			class="ring-1 ring-[#c2c1ca] dark:ring-[#686775] flex max-h-full flex-col gap-0 overflow-y-auto input reset-padding shadow-lg"
			tabindex="0"
		>
			{#if loading}
				<li class="h-[32px] flex items-center pl-4 pr-4">
					<Icon class="animate-spin" name="loading" />
				</li>
			{:else}
				{#each itemsToDisplay as item, index (index)}
					<li
						use:melt={$option({
							value: item,
							label: item.name,
						})}
						class="relative cursor-pointer scroll-my-2 rounded-md py-2 px-2
        data-[highlighted]:bg-gray-300 data-[highlighted]:text-gray-900
				dark:data-[highlighted]:bg-neutral-600 dark:data-[highlighted]:text-white
          data-[disabled]:opacity-50 {capitalize ? 'capitalize' : ''}"
					>
						{#if $isSelected(item)}
							<!-- None -->
						{/if}
						<div class="">
							<p>
								<span class="text-xs opacity-75">#{item.id}</span>
								<NameDisplay obj={item} />
							</p>
						</div>
					</li>
				{:else}
					<li
						class="relative cursor-pointer rounded-md py-1 px-2
        data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-700"
					>
						No results found
					</li>
				{/each}
			{/if}
		</div>
	</ul>
{/if}
