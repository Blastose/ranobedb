<script lang="ts" context="module">
	type Rec = Record<string, unknown>;
	type InputType = 'text' | 'number';
</script>

<script lang="ts" generics="T extends Rec">
	import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

	export let form: SuperForm<T, App.Superforms.Message>;
	export let field: FormPathLeaves<T>;
	export let label: string = '';
	export let type: InputType;
	export let placeholder: string = '';
	export let showRequiredSymbolIfRequired: boolean = true;
	export let resetPadding: boolean = false;
	export let disabled: boolean = false;
	export let before: string;
	export let after: string;

	const { value, errors, constraints } = formFieldProxy(form, field);

	$: link = `${before}${$value}${after}`;
</script>

<div class="flex flex-col gap-1">
	<label class="flex flex-col gap-1">
		<span>
			<span class="dark:text-[var(--text-dark)]">{label || String(field)}</span>
			{#if $constraints?.required && showRequiredSymbolIfRequired}
				<span class="error-text-color">*</span>
			{/if}
		</span>
		<span>
			<span>{before}</span>
			{#if type === 'number'}
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
			<span>{after}</span>
			{#if $value}<a class="link" target="_blank" href={link}>Preview link</a>{/if}
		</span>
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
