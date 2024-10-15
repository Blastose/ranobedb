<script lang="ts" context="module">
	type Rec = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Rec">
	import MarkdownToHtml from '../markdown/MarkdownToHtml.svelte';

	import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

	export let form: SuperForm<T, App.Superforms.Message>;
	export let field: FormPathLeaves<T>;
	export let label: string = '';
	export let placeholder: string = '';
	export let showRequiredSymbolIfRequired: boolean = true;
	export let textareaRows: number = 10;
	export let textareaCols: number = 30;
	export let resetPadding: boolean = false;
	export let disabled: boolean = false;
	export let labelId: string;

	const { value, errors, constraints } = formFieldProxy(form, field);

	let view: 'edit' | 'preview' = 'edit';
</script>

<div class="flex flex-col">
	<div class="flex justify-between items-center">
		<label for={labelId}>
			<span class="dark:text-[var(--text-dark)]">{label || String(field)}</span>
			{#if $constraints?.required && showRequiredSymbolIfRequired}
				<span class="error-text-color">*</span>
			{/if}
		</label>
		<div class="flex text-sm">
			<button
				class:active={view === 'edit'}
				type="button"
				class="view-button"
				on:click={() => {
					view = 'edit';
				}}>Markdown</button
			>
			<button
				class:active={view === 'preview'}
				type="button"
				class="view-button"
				on:click={() => {
					view = 'preview';
				}}>Preview</button
			>
		</div>
	</div>
	{#if view === 'edit'}
		<textarea
			id={labelId}
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
	{:else}
		<div class="markdown-output">
			<MarkdownToHtml markdown={$value?.toString() || 'Nothing to preview'} type="full" />
		</div>
	{/if}
	<p
		class:error-text-color={$value?.length >= ($constraints?.maxlength ?? Infinity)}
		class="text-sm pt-1 flex justify-end"
	>
		{$value?.trim()?.length || 0} / {$constraints?.maxlength} characters
	</p>
	{#if $errors}
		<span class="error-text-color">{$errors}</span>
	{/if}
</div>

<style>
	.markdown-output {
		border-width: 1px;
		border-color: var(--primary-400);
		padding: 0.5rem;
		border-radius: 0.375rem 0 0.375rem 0.375rem;
	}

	:global(.dark) .markdown-output {
		border-color: var(--primary-700);
	}

	.view-button {
		border-radius: 0.5rem 0.5rem 0 0;
		padding: 0.375rem 0.75rem;
		transition-duration: 150ms;
	}

	.view-button:hover:not(.active) {
		background-color: rgb(202, 202, 214);
	}

	:global(.dark) .view-button:hover:not(.active) {
		background-color: rgb(74, 74, 78);
	}

	.view-button.active {
		color: white;
		background-color: var(--primary-500);
	}
</style>
