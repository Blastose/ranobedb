<script lang="ts">
	import { anchors } from './anchors';
	import CodeBlock from './CodeBlock.svelte';
	import MethodBadge from './MethodBadge.svelte';
	import ParamList from './ParamList.svelte';
	import type { Endpoint } from './types';

	interface Props {
		endpoint: Endpoint;
		/** TypeScript response definition. */
		responseType?: string;
		/** Trimmed response captured from the public database. */
		example?: string;
		/** Show the example expanded; later examples in a group start collapsed. */
		openExample?: boolean;
		typeLinks?: Record<string, string>;
	}

	let { endpoint, responseType, example, openExample = false, typeLinks }: Props = $props();

	const name = $derived(`${endpoint.method} ${endpoint.path}`);
</script>

<section aria-labelledby={endpoint.id}>
	<div class="endpoint-head">
		<h4 id={endpoint.id} tabindex="-1" class="endpoint">
			<MethodBadge method={endpoint.method} />
			<code>{endpoint.path}</code>
		</h4>
		{#if endpoint.auth}
			<span class="auth-tag">Requires token</span>
		{/if}
		<a class="heading-anchor" href={`#${endpoint.id}`} aria-label={`Link to ${name}`}>
			<span aria-hidden="true">#</span>
		</a>
	</div>
	<p>{endpoint.summary}</p>

	{#if endpoint.curl}
		<p class="eyebrow">Example request</p>
		<CodeBlock code={endpoint.curl} id={`curl-${endpoint.id}`} label={`Copy curl for ${name}`} />
	{/if}

	{#if endpoint.pathParams?.length}
		<ParamList title="Path" params={endpoint.pathParams} {typeLinks} />
	{/if}

	{#if endpoint.params?.length}
		<ParamList title="Query" params={endpoint.params} {typeLinks} />
	{/if}

	{#if endpoint.body?.length}
		<ParamList title="Body" params={endpoint.body} {typeLinks} />
	{/if}

	{#if endpoint.bodyNote}
		<p>{endpoint.bodyNote}</p>
	{/if}

	<p class="eyebrow">Response</p>
	{#if endpoint.standardResponse}
		<p><a href={`#${anchors.standardResponses}`}>See Standard responses</a>.</p>
	{:else}
		{#if example && openExample}
			<p class="eyebrow example-label">
				<span>Example response</span>
				{#if endpoint.illustrative}
					<span class="illustrative">Illustrative</span>
				{/if}
			</p>
			<CodeBlock
				code={example}
				id={`example-${endpoint.id}`}
				label={`Copy example response for ${name}`}
				open
			/>
		{:else if example}
			<CodeBlock
				code={example}
				id={`example-${endpoint.id}`}
				label={`Copy example response for ${name}`}
				summary={endpoint.illustrative
					? 'Show example response (illustrative)'
					: 'Show example response'}
			/>
		{/if}
		{#if responseType}
			<CodeBlock
				code={responseType}
				id={`type-${endpoint.id}`}
				label={`Copy TypeScript type for ${name}`}
				summary="Show TypeScript type"
			/>
		{/if}
	{/if}
</section>

<style>
	.endpoint-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--docs-border);
	}

	.endpoint {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		margin: 0;
		font-size: 1.0625rem;
		scroll-margin-top: var(--docs-scroll-margin);
	}

	.endpoint code,
	:global(.dark) .endpoint code {
		padding: 0;
		border: 0;
		background: transparent;
		font-size: 1rem;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.auth-tag {
		padding: 0.0625rem 0.5rem;
		border: 1px solid var(--docs-border);
		border-radius: 9999px;
		background-color: var(--docs-surface);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--docs-muted);
	}

	.example-label {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin: 0.25rem 0;
	}

	.illustrative {
		padding: 0.0625rem 0.4375rem;
		border: 1px solid var(--docs-border);
		border-radius: 9999px;
		background-color: var(--docs-surface);
		letter-spacing: 0.05em;
	}
</style>
