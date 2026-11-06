<script lang="ts">
	import { anchors } from '$lib/components/api-docs/anchors';
	import CodeBlock from '$lib/components/api-docs/CodeBlock.svelte';
	import EndpointDoc from '$lib/components/api-docs/EndpointDoc.svelte';
	import FieldNotes from '$lib/components/api-docs/FieldNotes.svelte';
	import OverviewSection from '$lib/components/api-docs/OverviewSection.svelte';
	import ParamList from '$lib/components/api-docs/ParamList.svelte';
	import SectionHeading from '$lib/components/api-docs/SectionHeading.svelte';
	import StatusCodes from '$lib/components/api-docs/StatusCodes.svelte';
	import JumpMenu from '$lib/components/api-docs/JumpMenu.svelte';
	import TocNav from '$lib/components/api-docs/TocNav.svelte';
	import { copyState } from '$lib/components/api-docs/copy.svelte';
	import { scrollFade, scrollSpy } from '$lib/components/api-docs/scrollspy.svelte';
	import type { EndpointGroup } from '$lib/components/api-docs/types';
	import {
		commonTypes,
		databaseGroups,
		dbErrorExamples,
		dbStatusCodes,
		docToc,
		errorExamples,
		quickstartCurl,
		typeLinks,
		userExampleCurl,
		userGroups,
		userStatusCodes,
	} from './endpoints';
	import { responseExamples } from './examples';
	import { responseTypes, type ExampleKey, type ResponseKey } from './response-types';

	let activeId = $state<string>();
	/** The mobile jump bar; its height is part of the scroll-spy offset. */
	let jump = $state<HTMLDetailsElement>();

	const tocIds = docToc.flatMap((group) => [
		...(group.id ? [group.id] : []),
		...group.entries.map((entry) => entry.id),
	]);

	const exampleFor = (key: ResponseKey | undefined) =>
		key && key in responseExamples ? responseExamples[key as ExampleKey] : undefined;

	$effect(() =>
		scrollSpy({
			ids: tocIds,
			getOffset: () =>
				parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) +
				(jump?.offsetHeight ?? 0),
			onChange: (id) => (activeId = id),
		}),
	);
</script>

<svelte:head><title>RanobeDB API v0</title></svelte:head>

{#snippet groups(groups: EndpointGroup<ResponseKey>[])}
	{#each groups as group (group.id)}
		<section aria-labelledby={group.id}>
			<SectionHeading level={3} id={group.id} label={group.title} />
			{#if group.curl}
				<p class="eyebrow">Example request</p>
				<CodeBlock
					code={group.curl}
					id={`curl-${group.id}`}
					label={`Copy curl for ${group.title}`}
				/>
			{/if}
			{#each group.endpoints as endpoint, index (endpoint.id)}
				<EndpointDoc
					{endpoint}
					{typeLinks}
					openExample={index === 0}
					responseType={endpoint.responseKey ? responseTypes[endpoint.responseKey] : undefined}
					example={exampleFor(endpoint.responseKey)}
				/>
			{/each}
		</section>
	{/each}
{/snippet}

<main id={anchors.top} class="docs-scope container-rndb pb-16">
	<div class="doc-layout">
		<div class="doc-main min-w-0">
			<header class="mb-5">
				<h1 class="text-4xl font-bold">RanobeDB API v0</h1>
				<p class="mt-1 text-[var(--docs-muted)]">
					Read-only database queries and authenticated endpoints for your own user lists.
				</p>
			</header>

			<p class="sr-only" aria-live="polite">{copyState.id ? 'Copied to clipboard' : ''}</p>

			<JumpMenu groups={docToc} {activeId} bind:element={jump} />

			<div class="markdown doc-body min-w-0 [overflow-wrap:anywhere]">
				<OverviewSection
					{quickstartCurl}
					quickstartResponse={responseExamples.booksResponse}
					bookEndpointId={databaseGroups[0].endpoints[1].id}
					putResponseType={responseTypes.userPutResponse}
					deleteResponseType={responseTypes.userDeleteResponse}
				/>

				<section class="api-docs" aria-labelledby={anchors.databaseQuerying}>
					<SectionHeading level={2} id={anchors.databaseQuerying} label="Database querying" />
					<p class="max-w-[70ch]">
						Read-only endpoints. No authentication is required. Example responses are trimmed real
						responses from the public database: long strings end in an ellipsis and arrays keep a
						subset of their items.
					</p>

					<section aria-labelledby={anchors.dbCommonTypes}>
						<SectionHeading level={3} id={anchors.dbCommonTypes} label="Common types" />
						<ParamList params={commonTypes.database} {typeLinks} />
					</section>

					<FieldNotes id={anchors.dbFieldNotes} />

					<StatusCodes id={anchors.dbStatusCodes} rows={dbStatusCodes} errors={dbErrorExamples}>
						<p>
							The API does not enforce the guideline on <a href={`#${anchors.rateLimits}`}
								>Rate limits</a
							>, so it has no rate-limit status code.
						</p>
					</StatusCodes>

					{@render groups(databaseGroups)}
				</section>

				<section class="api-docs" aria-labelledby={anchors.user}>
					<SectionHeading level={2} id={anchors.user} label="User" />
					<p class="max-w-[70ch]">
						These endpoints require <a href={`#${anchors.authentication}`}>authentication</a>.
						Request bodies are JSON. Invalid bodies return <code>400</code> with a description of
						the invalid fields. Entities that do not exist, or list entries that are not in your
						list on
						<code>DELETE</code>, also return <code>400</code> — not <code>404</code>.
					</p>
					<p>
						Field names use the exact casing defined by the API. Some are camelCase (for example
						<code>readingStatus</code>) and some are snake_case (for example
						<code>release_status</code>); both are intentional.
					</p>

					<p class="eyebrow">Example request</p>
					<CodeBlock
						code={userExampleCurl}
						id="curl-user-book"
						label="Copy curl for PUT /user/book"
					/>

					<StatusCodes id={anchors.userStatusCodes} rows={userStatusCodes} errors={errorExamples} />

					<section aria-labelledby={anchors.userCommonTypes}>
						<SectionHeading level={3} id={anchors.userCommonTypes} label="Common types" />
						<ParamList params={commonTypes.user} {typeLinks} />
					</section>

					{@render groups(userGroups)}
				</section>

				<p class="mt-8">
					<a class="back-top" href={`#${anchors.top}`}>Back to top ↑</a>
				</p>
			</div>
		</div>

		<aside class="doc-rail">
			<div class="doc-rail-inner thin-scrollbar" use:scrollFade>
				<TocNav groups={docToc} label="On this page" {activeId} />
			</div>
		</aside>
	</div>
</main>

<style>
	.docs-scope {
		--docs-surface: var(--primary-100);
		--docs-surface-strong: var(--primary-200);
		--docs-surface-hover: var(--primary-300);
		--docs-border: var(--primary-300);
		--docs-text: var(--text-light);
		--docs-muted: var(--text-light-sub-alt);
		--docs-focus: var(--primary-500);
		/* Height of the sticky jump bar, which only exists below the desktop breakpoint. */
		--docs-sticky: 3.5rem;
		--docs-scroll-margin: calc(var(--header-height) + var(--docs-sticky) + 1rem);
	}

	:global(.dark) .docs-scope {
		--docs-surface: var(--dark-500);
		--docs-surface-strong: var(--dark-400);
		--docs-surface-hover: var(--dark-300);
		--docs-border: var(--dark-400);
		--docs-text: var(--text-dark);
		--docs-muted: var(--text-dark-sub-alt);
		--docs-focus: var(--link-dark);
	}

	.doc-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2rem;
		align-items: start;
	}

	.doc-rail {
		display: none;
	}

	.doc-rail-inner {
		max-height: calc(100dvh - var(--header-height) - 2rem);
		overflow-y: auto;
		padding-right: 0.5rem;
		/* Keeps a focused or current link clear of the fade below. */
		scroll-padding-bottom: 2.5rem;
	}

	/* Every link stays reachable; the fade only signals that the list continues. */
	.doc-rail-inner:global(.has-more) {
		mask-image: linear-gradient(to bottom, black calc(100% - 2.5rem), transparent);
	}

	.back-top {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 1rem;
		border: 1px solid var(--docs-border);
		border-radius: 9999px;
		font-size: 0.875rem;
		text-decoration: none;
	}

	.back-top:hover {
		background-color: var(--docs-surface);
	}

	/* The first section of the page has no rule above it. */
	:global(.doc-body > section:first-child > .doc-heading-2) {
		margin-top: 0;
		padding-top: 0;
		border-top: 0;
	}

	/* Shared with EndpointDoc, whose elements this component's scoped styles cannot reach. */
	:global(.docs-scope .heading-anchor) {
		font-weight: 400;
		text-decoration: none;
		opacity: 0;
		color: var(--docs-muted);
		transition: opacity 150ms;
	}

	:global(.docs-scope :is(.doc-heading, .endpoint-head):hover .heading-anchor),
	:global(.docs-scope .heading-anchor:focus-visible) {
		opacity: 1;
	}

	/* The one small-caps label style: eyebrows, example labels and details summaries. */
	:global(.docs-scope .eyebrow) {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		line-height: 1.1rem;
		text-transform: uppercase;
		color: var(--docs-muted);
	}

	:global(:where(.docs-scope) p.eyebrow) {
		margin: 1rem 0 0.375rem;
	}

	:global(.docs-scope :is(a, button, summary):focus-visible) {
		outline: 2px solid var(--docs-focus);
		outline-offset: 2px;
		border-radius: 0.125rem;
	}

	/* Headings only take focus after a jump link; they are not controls, so no ring. */
	:global(.docs-scope :is(h2, h3, h4)[tabindex='-1']:focus) {
		outline: none;
	}

	@media (min-width: 1024px) {
		.docs-scope {
			--docs-sticky: 0rem;
		}

		.doc-layout {
			grid-template-columns: minmax(0, 1fr) 16rem;
			gap: 2.5rem;
		}

		.doc-rail {
			display: block;
			position: sticky;
			top: calc(var(--header-height) + 1rem);
			align-self: start;
		}
	}

	@media (hover: none) {
		:global(.docs-scope .heading-anchor) {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.docs-scope .heading-anchor) {
			transition: none;
		}
	}
</style>
