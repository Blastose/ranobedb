<script lang="ts">
	import type { z, AnyZodObject } from 'zod';
	import type { ZodValidation, FormPathLeaves } from 'sveltekit-superforms';
	import { formFieldProxy, type SuperForm } from 'sveltekit-superforms/client';

	type T = $$Generic<AnyZodObject>;
	type inputType = 'text' | 'password' | 'email' | 'date';

	export let form: SuperForm<ZodValidation<T>, any>;
	export let field: FormPathLeaves<z.infer<T>>;

	export let label: string = '';
	export let placeholder: string = '';
	export let type: inputType = 'text';
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
		<input
			{...{ type }}
			name={field}
			{placeholder}
			class="input"
			class:reset-padding={!padding}
			class:error={$errors}
			aria-invalid={$errors ? 'true' : undefined}
			bind:value={$value}
			{...$constraints}
			{...$$restProps}
		/>
	</label>
	{#if $errors}
		<span class="text-red-600 dark:text-red-400">{$errors}</span>
	{/if}
</div>

<style>
	:global(.input) {
		background-color: rgb(229 231 235);
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
	}

	:global(.input.reset-padding) {
		padding: 0.5rem;
	}

	:global(.input:focus) {
		outline: 2px solid transparent;
		outline-offset: 2px;

		box-shadow: 0 0 0 2px var(--primary-600);
	}

	:global(.input.error) {
		box-shadow: 0 0 0 2px rgb(238, 82, 82);
	}

	:global(.input:focus.error) {
		box-shadow: 0 0 0 2px rgb(238, 82, 82);
	}

	:global(.dark .input.error) {
		box-shadow: 0 0 0 2px rgb(248 113 113);
	}

	:global(.dark .input) {
		background-color: var(--dark-500);
		color: white;
	}
</style>
