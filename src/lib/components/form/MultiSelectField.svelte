<script lang="ts" context="module">
	type Rec = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Rec">
	import type { Language } from '$lib/server/db/dbTypes';

	import { languageNames } from '$lib/db/dbConsts';

	import { fly } from 'svelte/transition';

	import { type SuperForm, arrayProxy, type FormPathArrays } from 'sveltekit-superforms';
	import { createSelect, melt, type SelectOption } from '@melt-ui/svelte';
	import { type Writable } from 'svelte/store';
	import Icon from '../icon/Icon.svelte';
	import HiddenInput from './HiddenInput.svelte';

	type DropdownOption = { display: string; value: string };
	export let form: SuperForm<T, App.Superforms.Message>;
	export let field: FormPathArrays<T>;
	export let labelText: string = '';
	export let dropdownOptions: ReadonlyArray<DropdownOption>;
	export let allSelectedText: string;

	let { values } = arrayProxy(form, field) as { values: Writable<string[]> };

	const {
		elements: { trigger, menu, option, label },
		states: { open },
		helpers: { isSelected },
	} = createSelect({
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true,
		},
		multiple: true,
		preventScroll: false,
		defaultSelected: $values.map((v) => ({
			value: v,
			label: languageNames[v as Language],
		})),
		onSelectedChange: handleSelectedChange,
	});

	function handleSelectedChange(args: {
		curr: SelectOption<string>[] | undefined;
		next: SelectOption<string>[] | undefined;
	}): SelectOption<string>[] | undefined {
		if (!args.next) {
			return undefined;
		}
		console.log(args.next);
		values.set(args.next.map((v) => v.value));
		return args.next;
	}
</script>

{#each $values as sel}
	<HiddenInput name={field} value={sel} />
{/each}

<!-- TODO This styling is messy; refactor with ComboboxInput.svelte -->
<div class="flex flex-col gap-1 whitespace-nowrap">
	<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
	<label use:melt={$label}>{labelText}</label>
	<button
		class="flex input round multiselect-padding items-center"
		use:melt={$trigger}
		aria-label="Options"
	>
		<span class="flex flex-wrap gap-2 min-w-[220px]">
			{#if $values.length === 0 || $values.length === dropdownOptions.length}
				<span class="chip">{allSelectedText}</span>
			{:else if $values.length <= 2}
				{#each $values as selectedItem}
					<span class="chip">{selectedItem}</span>
				{/each}
			{:else}
				<span class="chip">{$values[0]}</span>
				{#if $values.length !== 1}
					<span class="chip">+{$values.length - 1} more</span>
				{/if}
			{/if}
		</span>

		<Icon name="chevronDown" />
	</button>
	{#if $open}
		<div
			class="ring-1 ring-[#c2c1ca] dark:ring-[#686775] z-10 overflow-y-auto overflow-x-hidden flex gap-1 max-h-[300px] flex-col whitespace-nowrap rounded-lg p-1 input"
			use:melt={$menu}
			transition:fly={{ duration: 150, y: -5 }}
		>
			{#each dropdownOptions as dropdownOption}
				<div
					class="relative cursor-pointer scroll-my-2 rounded-full pr-2 pl-8
        data-[highlighted]:bg-gray-300 data-[highlighted]:text-gray-900
				dark:data-[highlighted]:bg-neutral-600 dark:data-[highlighted]:text-white
          data-[disabled]:opacity-50
          data-[selected]:bg-[var(--primary-500)] data-[selected]:text-white
          dark:data-[selected]:bg-[var(--primary-500)] dark:data-[selected]:text-white"
					use:melt={$option({ value: dropdownOption.value, label: dropdownOption.display })}
				>
					<div class="check {$isSelected(dropdownOption.value) ? 'block' : 'hidden'}">
						<Icon name="checkCircle" width="18" height="18" />
					</div>
					{dropdownOption.display}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.input.multiselect-padding {
		padding: 0.125rem 0.5rem;
	}
	.input.round {
		border-radius: 9999px;
	}

	.chip {
		padding: 0 0.5rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-weight: 600;
		color: var(--text-dark);
		background-color: var(--primary-500);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 128px;
	}

	.check {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		z-index: 20;
		translate: 0 -50%;
	}
</style>
