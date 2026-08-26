<script lang="ts" module>
	type Rec = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Rec">
	import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

	interface Props {
		form: SuperForm<T, App.Superforms.Message>;
		field: FormPathLeaves<T>;
		label?: string;
		placeholder?: string;
		showRequiredSymbolIfRequired?: boolean;
		resetPadding?: boolean;
		disabled?: boolean;
	}

	let {
		form,
		field,
		label = '',
		placeholder = '',
		showRequiredSymbolIfRequired = true,
		resetPadding = false,
		disabled = false,
		...rest
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const { value, errors, constraints } = formFieldProxy(form, field);
</script>

<div class="flex flex-col gap-1">
	<label class="flex flex-col gap-1">
		<span>
			<span class="dark:text-[var(--text-dark)]">{label || String(field)}</span>
			{#if $constraints?.required && showRequiredSymbolIfRequired}
				<span class="error-text-color">*</span>
			{/if}
		</span>

		<input
			type="text"
			name={field}
			{placeholder}
			{disabled}
			class="input"
			class:reset-padding={resetPadding}
			class:error={$errors}
			aria-invalid={$errors ? 'true' : undefined}
			bind:value={$value}
			{...$constraints}
			{...rest}
		/>
	</label>
	{#if $errors}
		<span class="error-text-color">{$errors}</span>
	{/if}
</div>
