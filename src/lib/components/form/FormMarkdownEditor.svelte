<script lang="ts">
	import FormTextArea from '$lib/components/form/FormTextArea.svelte';
	import marked from '$lib/marked/marked';
	import DOMPurify from 'isomorphic-dompurify';

	type ViewType = 'markdown' | 'preview';
	let view: ViewType = 'markdown';
	export let text: string;
	export let formIdName: string;
	export let formLabel: string;
	export let error = '';
	export let rows = 12;
	export let placeholder = '';

	let md: string = DOMPurify.sanitize(marked.parse(text));
	const setView = (viewType: ViewType) => {
		view = viewType;
		md = DOMPurify.sanitize(marked.parse(text));
	};
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-col gap-1">
		<label for={formIdName}>{formLabel}</label>
		{#if error}
			<span class="text-red-600 dark:text-red-400">{error}</span>
		{/if}
	</div>
	<div>
		<div class="flex ml-2">
			<button
				on:click={() => {
					setView('markdown');
				}}
				type="button"
				class="btn view-button"
				class:active={view === 'markdown'}>Markdown</button
			>
			<button
				on:click={() => {
					setView('preview');
				}}
				type="button"
				class="btn view-button"
				class:active={view === 'preview'}>Preview</button
			>
		</div>
		<div class={view === 'markdown' ? '' : 'hidden'}>
			<FormTextArea
				bind:value={text}
				{placeholder}
				name={formIdName}
				id={formIdName}
				required={false}
				{rows}
			/>
		</div>
		<div class="preview-area {view === 'markdown' ? 'hidden' : ''}">
			<div class="markdown-text">
				{@html md}
			</div>
		</div>
	</div>
</div>

<style>
	.view-button {
		border-radius: 0.375rem 0.375rem 0 0;
		padding: 0.25rem 0.5rem;
		transition-duration: 150ms;
	}

	:global(.dark) .view-button:not(:hover) {
		color: white;
	}

	.view-button.active {
		color: white;
		background-color: var(--primary-500);
	}

	.preview-area {
		padding: 0.5rem;
		border-radius: 0.375rem;
		border: var(--primary-500) solid 1px;
		background-color: var(--primary-50);
	}

	:global(.dark) .preview-area {
		background-color: var(--dark-700);
	}
</style>
