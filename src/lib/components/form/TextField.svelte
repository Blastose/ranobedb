<script lang="ts" module>
	type Rec = Record<string, unknown>;
	type InputType = 'text' | 'password' | 'email' | 'date' | 'number' | 'textarea';
</script>

<script lang="ts" generics="T extends Rec">
	import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

	interface Props {
		form: SuperForm<T, App.Superforms.Message>;
		field: FormPathLeaves<T>;
		label?: string;
		placeholder?: string;
		type?: InputType;
		showRequiredSymbolIfRequired?: boolean;
		textareaRows?: number;
		textareaCols?: number;
		resetPadding?: boolean;
		disabled?: boolean;
		showLabel?: boolean;
		autocomplete?: 'on' | 'off' | undefined;
	}

	let {
		form,
		field,
		label = '',
		placeholder = '',
		type = 'text',
		showRequiredSymbolIfRequired = true,
		textareaRows = 10,
		textareaCols = 30,
		resetPadding = false,
		disabled = false,
		showLabel = true,
		autocomplete = undefined,
		...rest
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const { value, errors, constraints } = formFieldProxy(form, field);
</script>

<div class="flex flex-col gap-1">
	<label class="flex flex-col gap-1">
		{#if showLabel}
			<span>
				<span class="dark:text-[var(--text-dark)]">{label || String(field)}</span>
				{#if $constraints?.required && showRequiredSymbolIfRequired}
					<span class="error-text-color">*</span>
				{/if}
			</span>
		{/if}
		{#if type === 'textarea'}
			<textarea
				name={field}
				{placeholder}
				cols={textareaCols}
				rows={textareaRows}
				{disabled}
				class="input"
				class:reset-padding={resetPadding}
				class:error={$errors}
				aria-invalid={$errors ? 'true' : undefined}
				bind:value={$value}
				{...$constraints}
				{...rest}></textarea>
		{:else if type === 'number'}
			<input
				type="number"
				name={field}
				{placeholder}
				{disabled}
				{autocomplete}
				class="input"
				class:reset-padding={resetPadding}
				class:error={$errors}
				aria-invalid={$errors ? 'true' : undefined}
				bind:value={$value}
				{...$constraints}
				{...rest}
			/>
		{:else}
			<input
				{...{ type }}
				name={field}
				{placeholder}
				{disabled}
				{autocomplete}
				class="input"
				class:reset-padding={resetPadding}
				class:error={$errors}
				aria-invalid={$errors ? 'true' : undefined}
				bind:value={$value}
				{...$constraints}
				{...rest}
				pattern={undefined}
			/>
		{/if}
	</label>
	{#if $errors}
		<span class="error-text-color">{$errors.join(', ')}</span>
	{/if}
</div>

<style>
	.input:disabled {
		background-color: unset;
	}
</style>
