<script lang="ts" context="module">
	import type { AnyZodObject } from 'zod';
	type T = AnyZodObject;
	type InputType = 'text' | 'password' | 'email' | 'date' | 'number' | 'textarea';
</script>

<script lang="ts" generics="T extends AnyZodObject">
	import type { z } from 'zod';
	import type { ZodValidation, FormPathLeaves } from 'sveltekit-superforms';
	import { formFieldProxy, type SuperForm } from 'sveltekit-superforms/client';

	export let form: SuperForm<ZodValidation<T>, App.Superforms.Message>;
	export let field: FormPathLeaves<z.infer<T>>;
	export let label: string = '';
	export let placeholder: string = '';
	export let type: InputType = 'text';
	export let showRequiredSymbolIfRequired: boolean = true;
	export let textareaRows: number = 10;
	export let textareaCols: number = 30;

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
		{#if type === 'textarea'}
			<textarea
				name={field}
				{placeholder}
				cols={textareaCols}
				rows={textareaRows}
				class="input"
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
				class="input"
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
				class="input"
				class:error={$errors}
				aria-invalid={$errors ? 'true' : undefined}
				bind:value={$value}
				{...$constraints}
				{...$$restProps}
			/>
		{/if}
	</label>
	{#if $errors}
		<span class="text-red-600 dark:text-red-400">{$errors}</span>
	{/if}
</div>
