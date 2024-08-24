<script lang="ts" context="module">
	type Rec = Record<string, unknown>;
	type InputType = 'text' | 'password' | 'email' | 'date' | 'number' | 'textarea';
</script>

<script lang="ts" generics="T extends Rec">
	import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

	export let form: SuperForm<T, App.Superforms.Message>;
	export let field: FormPathLeaves<T>;
	export let label: string = '';
	export let placeholder: string = '';
	export let type: InputType = 'text';
	export let showRequiredSymbolIfRequired: boolean = true;
	export let textareaRows: number = 10;
	export let textareaCols: number = 30;
	export let resetPadding: boolean = false;
	export let disabled: boolean = false;
	export let showLabel: boolean = true;

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
				{...$$restProps}
			/>
		{:else if type === 'number'}
			<input
				type="number"
				name={field}
				{placeholder}
				{disabled}
				class="input"
				class:reset-padding={resetPadding}
				class:error={$errors}
				aria-invalid={$errors ? 'true' : undefined}
				bind:value={$value}
				{...$constraints}
				{...$$restProps}
			/>
		{:else}
			<input
				{...{ type }}
				name={field}
				{placeholder}
				{disabled}
				class="input"
				class:reset-padding={resetPadding}
				class:error={$errors}
				aria-invalid={$errors ? 'true' : undefined}
				bind:value={$value}
				{...$constraints}
				{...$$restProps}
			/>
		{/if}
	</label>
	{#if $errors}
		<span class="error-text-color">{$errors}</span>
	{/if}
</div>

<style>
	.input:disabled {
		background-color: unset;
	}
</style>
