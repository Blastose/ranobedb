<script lang="ts" context="module">
	import type { AnyZodObject } from 'zod';
	type T = AnyZodObject;
</script>

<script lang="ts" generics="T extends AnyZodObject">
	import type { z } from 'zod';
	import type { ZodValidation, FormPathLeaves } from 'sveltekit-superforms';
	import { formFieldProxy, type SuperForm } from 'sveltekit-superforms/client';

	type DropdownOption = { display: string; value: string };
	export let form: SuperForm<ZodValidation<T>, App.Superforms.Message>;
	export let field: FormPathLeaves<z.infer<T>>;
	export let label: string = '';
	export let selectedValue: string;
	export let dropdownOptions: ReadonlyArray<DropdownOption> | Array<DropdownOption>;
	export let showRequiredSymbolIfRequired: boolean = true;

	const { value, errors, constraints } = formFieldProxy(form, field);
</script>

<div class="flex flex-col gap-1">
	<label class="flex flex-col gap-1">
		<span>
			<span class="dark:text-white">{label || String(field)}</span>
			{#if $constraints?.required && showRequiredSymbolIfRequired}
				<span class="text-red-600 dark:text-red-400">*</span>
			{/if}
		</span>
		<select
			name={field}
			class="input"
			class:error={$errors}
			aria-invalid={$errors ? 'true' : undefined}
			bind:value={$value}
			{...$constraints}
			{...$$restProps}
		>
			{#each dropdownOptions as dropdownOption}
				<option selected={selectedValue === dropdownOption.value} value={dropdownOption.value}
					>{dropdownOption.display}</option
				>
			{/each}
		</select>
	</label>
	{#if $errors}
		<span class="text-red-600 dark:text-red-400">{$errors}</span>
	{/if}
</div>
