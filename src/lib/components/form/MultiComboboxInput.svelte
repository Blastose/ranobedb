<script lang="ts" context="module">
	import type { Nullish } from '$lib/server/zod/schema';

	type Rec = { id: number; name: string; romaji?: Nullish<string> };
</script>

<script lang="ts" generics="T extends Rec">
	import HiddenInput from './HiddenInput.svelte';

	import { createCombobox, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import Icon from '../icon/Icon.svelte';

	const {
		elements: { menu, input, option, label },
		states: { open, inputValue, touchedInput, selected },
		helpers: { isSelected },
	} = createCombobox({
		forceVisible: true,
		preventScroll: false,
		multiple: true,
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
				const json = await fetch(`/api/i/staff?name=${$inputValue}`);
				searchedItems = await json.json();
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
			// handleAdd($selected.value);
		}
	}

	$: filteredItems = searchedItems.filter((si) => true);

	// $: filteredMangas = $touchedInput
	// 	? mangas.filter(({ title, author }) => {
	// 			const normalizedInput = $inputValue.toLowerCase();
	// 			return (
	// 				title.toLowerCase().includes(normalizedInput) ||
	// 				author.toLowerCase().includes(normalizedInput)
	// 			);
	// 		})
	// 	: mangas;
</script>

{#if $selected}
	{#each $selected as sel}
		<HiddenInput name={'staff'} value={sel.id} />
	{/each}
{/if}

<div class="max-w-sm">
	<div class="flex flex-col gap-1">
		<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
		<label use:melt={$label}>
			<span
				>Title here {#if $selected}<span class="text-xs rounded-full px-2 bg-[var(--primary-500)]"
						>{$selected?.length}</span
					>{/if}</span
			>
		</label>

		<div class="relative w-full max-w-sm">
			<div class="absolute left-2 top-1/2 -translate-y-1/2"><Icon name="search" /></div>
			<input
				use:melt={$input}
				class="combobox input reset-padding w-full !pl-10 !pr-8"
				placeholder="Name"
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

	<p class="line-clamp-1">{JSON.stringify($selected?.map((v) => v.value))}</p>
</div>
{#if $open}
	<ul
		class="z-10 flex max-h-[300px] flex-col rounded-lg"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -5 }}
	>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div
			class="ring-1 ring-[#c2c1ca] dark:ring-[#686775] flex max-h-full flex-col gap-1 overflow-y-auto input reset-padding shadow-lg"
			tabindex="0"
		>
			{#if loading}
				<li class="h-[32px] flex items-center pl-4 pr-4">
					<Icon class="animate-spin" name="loading" />
				</li>
			{:else}
				{#each filteredItems as book, index (index)}
					<li
						use:melt={$option({
							value: book,
							label: book.name,
						})}
						class="relative cursor-pointer scroll-my-2 rounded-full pr-2 pl-8
        data-[highlighted]:bg-gray-300 data-[highlighted]:text-gray-900
				dark:data-[highlighted]:bg-neutral-600 dark:data-[highlighted]:text-white
          data-[disabled]:opacity-50
          data-[selected]:bg-[var(--primary-500)] data-[selected]:text-white
          dark:data-[selected]:bg-[var(--primary-500)] dark:data-[selected]:text-white"
					>
						{#if $isSelected(book)}
							<div class="check">
								<Icon name="checkCircle" width="18" height="18" />
							</div>
						{/if}
						<span>{book.name}</span>
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

<style>
	.check {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		z-index: 20;
		translate: 0 -50%;
	}
</style>
