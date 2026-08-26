<script lang="ts" module>
	import type { Nullish } from '$lib/server/zod/schema';

	type Rec = { id: number; name: string; romaji?: Nullish<string> };
</script>

<script lang="ts" generics="T extends Rec">
	import { Combobox, useId } from 'bits-ui';
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import Icon from '../icon/Icon.svelte';
	import NameDisplay from '../display/NameDisplay.svelte';
	import NameDisplayBoth from '../display/NameDisplayBoth.svelte';

	let {
		title,
		handleAdd,
		search,
		selectedItems,
		filterDuplicateIds,
		capitalize = false,
		small = false,
		displayBothNames = false,
	}: {
		title: string;
		handleAdd: (item: T) => void;
		search: (input: string) => Promise<T[]>;
		selectedItems: Pick<T, 'id'>[];
		filterDuplicateIds: boolean;
		capitalize?: boolean;
		small?: boolean;
		displayBothNames?: boolean;
	} = $props();

	const inputId = useId('combobox-input');

	let loading = $state(false);
	let inputVal = $state('');
	let inputElement = $state<HTMLInputElement>();
	let open = $state(false);
	let value = $state<string>('');
	let searchedItems: T[] = $state([]);
	let viewportRef = $state<HTMLElement>();
	let dropdownWidth = $derived.by(() => (inputElement && open ? inputElement.offsetWidth : 0));
	let searchTimer: ReturnType<typeof setTimeout> | undefined;

	let filteredItems = $derived(
		searchedItems.filter((si) => !selectedItems.some((v) => v.id === si.id)),
	);
	let itemsToDisplay = $derived(filterDuplicateIds ? filteredItems : searchedItems);

	onDestroy(() => clearTimeout(searchTimer));

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		inputVal = e.currentTarget.value;
		clearTimeout(searchTimer);
		if (inputVal.length === 0) {
			searchedItems = [];
			open = false;
			loading = false;
			return;
		}
		loading = true;
		searchTimer = setTimeout(async () => {
			searchedItems = await search(inputVal);
			loading = false;
		}, 450);
	}

	function onNavKeydown(e: KeyboardEvent) {
		if (
			e.key === 'ArrowDown' ||
			e.key === 'ArrowUp' ||
			e.key === 'Home' ||
			e.key === 'End' ||
			e.key === 'PageUp' ||
			e.key === 'PageDown'
		) {
			requestAnimationFrame(() => {
				const el = viewportRef?.querySelector('[data-highlighted]');
				if (el instanceof HTMLElement) {
					el.scrollIntoView({ block: 'nearest' });
				}
			});
		}
	}
</script>

<Combobox.Root
	type="single"
	bind:value
	bind:open
	onValueChange={(v) => {
		if (v) {
			const item = searchedItems.find((si) => si.id.toString() === v);
			if (item) handleAdd(item);
		}
		value = '';
		inputElement?.blur();
	}}
>
	<div class="flex flex-col gap-1">
		<label for={inputId}>
			<span>{title}</span>
		</label>
		<div class="relative w-full {small ? 'max-w-xs' : 'max-w-sm'}">
			<div class="absolute left-2 top-1/2 -translate-y-1/2"><Icon name="search" /></div>
			<Combobox.Input>
				{#snippet child({ props })}
					<input
						{...props}
						id={inputId}
						value={inputVal}
						onfocus={() => {
							open = true;
						}}
						oninput={(e) => {
							(props.oninput as ((ev: Event) => void) | undefined)?.(e);
							handleInput(e);
						}}
						bind:this={inputElement}
						onkeydown={(e) => {
							(props.onkeydown as ((ev: KeyboardEvent) => void) | undefined)?.(e);
							onNavKeydown(e);
						}}
						class="combobox input w-full !pl-10 !pr-8 {small ? 'small' : ''}"
						placeholder="Name"
					/>
				{/snippet}
			</Combobox.Input>
			<div class="text-magnum-900 absolute right-2 top-1/2 z-10 -translate-y-1/2">
				{#if open && inputVal.length > 0}
					<Icon name="chevronUp" />
				{:else}
					<Icon name="chevronDown" />
				{/if}
			</div>
		</div>
	</div>
	<Combobox.Portal>
		<Combobox.Content forceMount sideOffset={6}>
			{#snippet child({ wrapperProps, props, open: contentOpen })}
				{#if contentOpen && inputVal.length > 0}
					<div {...wrapperProps}>
						<div
							{...props}
							style={dropdownWidth > 0 ? `width: ${dropdownWidth}px` : ''}
							class="z-[99999] flex flex-col rounded-lg"
							transition:fly={{ duration: 150, y: -5 }}
						>
							<div
								bind:this={viewportRef}
								class="combobox-viewport input reset-padding flex max-h-[300px] flex-col gap-0 overflow-y-auto shadow-lg ring-1 ring-[#c2c1ca] dark:ring-[#686775]"
								style="scrollbar-width: auto;"
							>
								{#if loading}
									<li class="flex h-[32px] items-center pl-4 pr-4">
										<Icon class="animate-spin" name="loading" />
									</li>
								{:else}
									{#each itemsToDisplay as item (item.id)}
										<Combobox.Item
											value={item.id.toString()}
											class="relative cursor-pointer scroll-my-2 rounded-md px-2 py-2
											data-[highlighted]:bg-gray-300 data-[highlighted]:text-gray-900
											data-[disabled]:opacity-50 dark:data-[highlighted]:bg-neutral-600
											dark:data-[highlighted]:text-white {capitalize ? 'capitalize' : ''}"
										>
											<div>
												<p>
													<span class="text-xs opacity-75">#{item.id}</span>
													{#if displayBothNames}<NameDisplayBoth obj={item} />{:else}<NameDisplay
															obj={item}
														/>{/if}
												</p>
											</div>
										</Combobox.Item>
									{:else}
										<li
											class="relative cursor-pointer rounded-md px-2 py-1
											data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-700"
										>
											No results found
										</li>
									{/each}
								{/if}
							</div>
						</div>
					</div>
				{/if}
			{/snippet}
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
