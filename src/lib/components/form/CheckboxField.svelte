<script lang="ts" module>
	type Rec = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Rec">
	import type { Snippet } from 'svelte';
	import {
		formFieldProxy,
		type SuperForm,
		type FormPathLeaves,
		type FormFieldProxy,
	} from 'sveltekit-superforms';

	interface Props {
		form: SuperForm<T, App.Superforms.Message>;
		field: FormPathLeaves<T, boolean>;
		showRequiredSymbolIfRequired?: boolean;
		disabled?: boolean;
		label?: string;
		children?: Snippet;
	}

	let {
		form,
		field,
		showRequiredSymbolIfRequired = true,
		disabled = false,
		label = '',
		children,
		...rest
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const { value, errors, constraints } = formFieldProxy(
		form,
		field,
	) satisfies FormFieldProxy<boolean>;
</script>

<div class="flex w-fit flex-col gap-1">
	<label class="flex gap-2"
		><input
			name={field}
			type="checkbox"
			class="checkbox"
			bind:checked={$value}
			{disabled}
			{...$constraints}
			{...rest}
		/><span class={disabled ? 'italic' : ''} style="line-height: normal;"
			>{label}{@render children?.()}{#if $constraints?.required && showRequiredSymbolIfRequired}
				<span class="error-text-color">*</span>
			{/if}</span
		>
	</label>

	{#if $errors}
		<span class="error-text-color">{$errors}</span>
	{/if}
</div>
