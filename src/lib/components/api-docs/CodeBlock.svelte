<script lang="ts">
	import { copyCode, copyState } from './copy.svelte';

	interface Props {
		code: string;
		id: string;
		/** Accessible name of the copy button, e.g. "Copy example response for GET /books". */
		label: string;
		/** When set, the block is wrapped in a <details> element with this summary. */
		summary?: string;
		open?: boolean;
	}

	let { code, id, label, summary, open = false }: Props = $props();

	const copied = $derived(copyState.id === id);
</script>

{#snippet block()}
	<div class="code-wrap">
		<pre>{code}</pre>
		<button type="button" class="copy-btn" aria-label={label} onclick={() => copyCode(code, id)}>
			<!-- Success is announced once by the page's live region, not by this button. -->
			<span aria-hidden="true">{copied ? 'Copied' : 'Copy'}</span>
		</button>
	</div>
{/snippet}

{#if summary}
	<details class="code-block" {open}>
		<summary class="eyebrow">{summary}</summary>
		{@render block()}
	</details>
{:else}
	{@render block()}
{/if}

<style>
	.code-wrap {
		position: relative;
	}

	.code-wrap pre {
		margin: 0.25rem 0;
		padding: 0.5rem 4.5rem 0.5rem 0.5rem;
		overflow-x: auto;
		border-radius: 0.25rem;
		background-color: var(--docs-surface);
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	/* `.markdown pre` in app.css sets a literal dark colour; keep the token instead. */
	:global(.dark) .code-wrap pre {
		background-color: var(--docs-surface);
	}

	.copy-btn {
		position: absolute;
		top: 0.4rem;
		right: 0.5rem;
		padding: 0.1875rem 0.5rem;
		border: 1px solid var(--docs-border);
		border-radius: 9999px;
		background-color: var(--docs-surface-strong);
		color: var(--docs-text);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.25;
		transition: background-color 150ms;
	}

	.copy-btn:hover {
		background-color: var(--docs-surface-hover);
	}

	.code-block {
		margin: 0.5rem 0;
		border: 1px solid var(--docs-border);
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.code-block > summary {
		cursor: pointer;
		padding: 0.375rem 0.75rem;
	}

	.code-block > summary:hover {
		background-color: var(--docs-surface);
	}

	.code-block[open] > summary {
		border-bottom: 1px solid var(--docs-border);
	}

	.code-block pre {
		margin: 0;
		border-radius: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.copy-btn {
			transition: none;
		}
	}
</style>
