<script lang="ts" context="module">
	type Rec = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Rec">
	import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

	type DropdownOption = { display: string; value: string };
	export let form: SuperForm<T, App.Superforms.Message>;
	export let field: FormPathLeaves<T>;
	export let label: string = '';
	export let selectedValue: string;
	export let dropdownOptions: ReadonlyArray<DropdownOption>;
	export let showRequiredSymbolIfRequired: boolean = true;
	export let resetPadding: boolean = false;
	export let fit: boolean;

	const { value, errors, constraints } = formFieldProxy(form, field);
</script>

<div class="flex flex-col gap-1 {fit ? 'w-fit' : ''}">
	<label class="flex flex-col gap-1">
		<span>
			<span class="dark:text-white">{label || String(field)}</span>
			{#if $constraints?.required && showRequiredSymbolIfRequired}
				<span class="error-text-color">*</span>
			{/if}
		</span>
		<select
			name={field}
			class="input"
			class:reset-padding={resetPadding}
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
		<span class="error-text-color">{$errors}</span>
	{/if}
</div>
