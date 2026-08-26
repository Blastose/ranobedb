<script lang="ts" module>
	type Rec = Record<string, unknown>;
	type InputType = 'text' | 'number';
</script>

<script lang="ts" generics="T extends Rec">
	import { buildLink, type LinkBeforeAfter } from '$lib/components/db-links/db-ext-links';
	import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

	interface Props {
		form: SuperForm<T, App.Superforms.Message>;
		field: FormPathLeaves<T>;
		label?: string;
		type: InputType;
		placeholder?: string;
		showRequiredSymbolIfRequired?: boolean;
		resetPadding?: boolean;
		disabled?: boolean;
		linkBeforeAfter: LinkBeforeAfter;
	}

	let {
		form,
		field,
		label = '',
		type,
		placeholder = '',
		showRequiredSymbolIfRequired = true,
		resetPadding = false,
		disabled = false,
		linkBeforeAfter,
		...rest
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const { value, errors, constraints } = formFieldProxy(form, field);
	let link = $derived(buildLink({ ...linkBeforeAfter, value: String($value) }));
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
			<span>{linkBeforeAfter.before}</span>
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
					{...rest}
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
					{...rest}
				/>
			{/if}
			<span>{linkBeforeAfter.after}</span>
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
