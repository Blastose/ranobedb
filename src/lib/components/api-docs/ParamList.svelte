<script lang="ts">
	import { longUnionMembers, splitTypeParts } from './type-parts';
	import type { Param } from './types';

	interface Props {
		params: Param[];
		title?: string;
		/** Shared type name to the in-page link where it is defined. */
		typeLinks?: Record<string, string>;
	}

	let { params, title, typeLinks = {} }: Props = $props();

	const uid = $props.id();

	const typeParts = (type: string) => splitTypeParts(type, typeLinks);
</script>

<div role={title ? 'group' : undefined} aria-labelledby={title ? uid : undefined}>
	{#if title}
		<p class="eyebrow" id={uid}>{title}</p>
	{/if}
	<dl class="params">
		{#each params as param}
			<div class="param-row">
				<dt>
					<code>{param.name}</code>
					{#if param.required}<span class="sr-only"> (required)</span>{/if}
				</dt>
				<dd>
					<span class="param-head">
						{#if longUnionMembers(param.type)}
							{@const members = longUnionMembers(param.type) ?? []}
							<details class="param-type param-union">
								<summary>Show all {members.length} values</summary>
								<ul class="chips">
									{#each members as member}<li><code>{member}</code></li>{/each}
								</ul>
							</details>
						{:else}
							<code class="param-type"
								>{#each typeParts(param.type) as part}{#if part.href}<a href={part.href}
											>{part.text}</a
										>{:else}{part.text}{/if}{/each}</code
							>
						{/if}
						{#if param.required}
							<!-- The term above already says "required" to screen readers. -->
							<span class="param-required" aria-hidden="true">Required</span>
						{/if}
					</span>
					{#if param.description || param.default}
						<span class="param-desc">
							{#if param.description}{@html param.description}{/if}
							{#if param.default}Default <code>{param.default}</code>.{/if}
						</span>
					{/if}
				</dd>
			</div>
		{/each}
	</dl>
</div>

<style>
	.params {
		margin: 0.5rem 0;
		padding: 0.25rem 0.75rem;
		background-color: var(--docs-surface);
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.param-row {
		display: grid;
		grid-template-columns: minmax(7rem, 10rem) minmax(0, 1fr);
		gap: 0.125rem 0.75rem;
		padding: 0.4rem 0;
		border-top: 1px solid var(--docs-border);
	}

	.param-row:first-child {
		border-top: 0;
	}

	.param-row dt {
		min-width: 0;
		font-weight: 500;
		overflow-wrap: anywhere;
	}

	.param-row dd {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
		margin: 0;
		overflow-wrap: anywhere;
	}

	/* The type sits on the left and the Required marker in a fixed slot on the right. */
	.param-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		min-height: 1.5rem;
	}

	.params code,
	:global(.dark) .params code {
		padding: 0;
		border: 0;
		background: transparent;
		font-size: 0.875rem;
		overflow-wrap: anywhere;
	}

	.param-union summary {
		cursor: pointer;
		font-size: 0.8125rem;
		color: var(--docs-muted);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin: 0.375rem 0 0.25rem;
		padding: 0;
		list-style: none;
	}

	.chips li {
		margin: 0;
	}

	.params .chips code,
	:global(.dark) .params .chips code {
		display: block;
		padding: 0.0625rem 0.375rem;
		border: 1px solid var(--docs-border);
		border-radius: 0.25rem;
		background-color: var(--docs-surface-strong);
		font-size: 0.8125rem;
	}

	.param-desc {
		font-size: 0.8125rem;
		line-height: 1.35;
		color: var(--docs-muted);
	}

	.param-required {
		flex: none;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--docs-text);
	}

	/* Narrow screens: name and Required share the first row, then the type, then the description. */
	@media (max-width: 479px) {
		.param-row {
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 0 0.5rem;
			padding: 0.375rem 0;
		}

		.param-row dd,
		.param-head {
			display: contents;
		}

		.param-row dt {
			grid-column: 1;
			grid-row: 1;
		}

		.param-required {
			grid-column: 2;
			grid-row: 1;
			align-self: center;
		}

		.params .param-type {
			grid-column: 1 / -1;
			grid-row: 2;
		}

		.params code.param-type {
			grid-column: 1 / -1;
			grid-row: 2;
			font-size: 0.8125rem;
			color: var(--docs-muted);
		}

		.param-desc {
			grid-column: 1 / -1;
			grid-row: 3;
			margin-top: 0.125rem;
		}

		.param-head {
			min-height: 0;
		}
	}
</style>
