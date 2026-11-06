<script lang="ts">
	import type { Snippet } from 'svelte';
	import CodeBlock from './CodeBlock.svelte';
	import SectionHeading from './SectionHeading.svelte';
	import type { ErrorExample, StatusRow } from './types';

	interface Props {
		id: string;
		rows: StatusRow[];
		errors: ErrorExample[];
		/** Extra content after the example error bodies. */
		children?: Snippet;
	}

	let { id, rows, errors, children }: Props = $props();
</script>

<section aria-labelledby={id}>
	<SectionHeading level={3} {id} label="Status codes" />
	<table class="status-table">
		<thead>
			<tr>
				<th scope="col" class="eyebrow">Status</th>
				<th scope="col" class="eyebrow">Meaning</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.status)}
				<tr>
					<td><code>{row.status}</code></td>
					<td>{@html row.meaning}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<p class="eyebrow">Example error bodies</p>
	<div class="error-bodies">
		{#each errors as example (example.status)}
			<div>
				<p class="error-caption">
					<code>{example.status}</code>
					{example.reason} — {example.note}
				</p>
				<CodeBlock
					code={example.body}
					id={`error-${example.status}`}
					label={`Copy ${example.status} error body`}
				/>
			</div>
		{/each}
	</div>
	{@render children?.()}
</section>

<style>
	.status-table {
		width: 100%;
		margin: 0.5rem 0;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.status-table th,
	.status-table td {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--docs-border);
		text-align: left;
		vertical-align: top;
	}

	.status-table th {
		background-color: var(--docs-surface);
	}

	.status-table td {
		overflow-wrap: anywhere;
	}

	.error-bodies {
		display: grid;
		gap: 0.75rem;
	}

	.error-caption {
		margin: 0.25rem 0;
		font-size: 0.8125rem;
		color: var(--docs-muted);
	}

	@media (min-width: 640px) {
		.error-bodies {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
