<script lang="ts" module>
	type Rec = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Rec, V extends string">
	import { run } from 'svelte/legacy';
	import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

	type DropdownOption = { display: string; value: V };

	interface Props {
		form: SuperForm<T, App.Superforms.Message>;
		field: FormPathLeaves<T>;
		label?: string;
		selectedValue: V;
		dropdownOptions: ReadonlyArray<DropdownOption>;
		showRequiredSymbolIfRequired?: boolean;
		resetPadding?: boolean;
		fit: boolean;
		column?: boolean;
		onChange?: (newValue: V) => void;
	}

	let {
		form,
		field,
		label = '',
		selectedValue,
		dropdownOptions,
		showRequiredSymbolIfRequired = true,
		resetPadding = false,
		fit,
		column = true,
		onChange = () => {},
		...rest
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const { value, errors, constraints } = formFieldProxy(form, field);

	run(() => {
		onChange($value as V);
	});
</script>

<div class="flex flex-col gap-1 {fit ? 'w-fit' : ''}">
	<label class="flex {column ? 'flex-col' : 'items-center'} gap-1">
		<span>
			<span>{label || String(field)}</span>
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
			{...rest}
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
