<script lang="ts">
	import type { ZodValidation, FormPathLeaves } from 'sveltekit-superforms';
	import type { SuperForm } from 'sveltekit-superforms/client';
	import { formFieldProxy } from 'sveltekit-superforms/client';
	import type { z, AnyZodObject } from 'zod';

	type T = $$Generic<AnyZodObject>;
	type DropdownOption = { displayText: string; value: string };

	export let form: SuperForm<ZodValidation<T>, any>;
	export let field: FormPathLeaves<z.infer<T>>;

	export let selectedValue: string;
	export let label: string = '';
	export let dropdownOptions: ReadonlyArray<DropdownOption>;
	export let padding: boolean = true;
	export let showRequiredSymbolIfRequired: boolean = true;

	const { path, value, errors, constraints } = formFieldProxy(form, field);
</script>

<div class="flex flex-col gap-1">
	<label class="flex flex-col gap-1">
		<span>
			<span class="dark:text-white">{label || String(path)}</span>
			{#if $constraints?.required && showRequiredSymbolIfRequired}
				<span class="text-red-600 dark:text-red-400">*</span>
			{/if}
		</span>
		<select
			class="input"
			class:reset-padding={!padding}
			name={field}
			data-invalid={$errors}
			bind:value={$value}
			{...$constraints}
			{...$$restProps}
		>
			{#each dropdownOptions as dropdownOption}
				<option value={dropdownOption.value} selected={selectedValue === dropdownOption.value}>
					{dropdownOption.displayText}
				</option>
			{/each}
		</select>
	</label>
	{#if $errors}
		<span class="text-red-600 dark:text-red-400">{$errors}</span>
	{/if}
</div>
