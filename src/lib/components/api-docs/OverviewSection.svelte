<script lang="ts">
	import { anchors } from './anchors';
	import CodeBlock from './CodeBlock.svelte';
	import SectionHeading from './SectionHeading.svelte';

	interface Props {
		quickstartCurl: string;
		/** Trimmed response of the quickstart request. */
		quickstartResponse: string;
		/** Id of the `GET /book/[id]` endpoint the quickstart links to. */
		bookEndpointId: string;
		/** TypeScript types of the two shared /user responses. */
		putResponseType: string;
		deleteResponseType: string;
	}

	let {
		quickstartCurl,
		quickstartResponse,
		bookEndpointId,
		putResponseType,
		deleteResponseType,
	}: Props = $props();
</script>

<section aria-labelledby={anchors.introduction}>
	<SectionHeading level={2} id={anchors.introduction} label="Introduction" />
	<p>
		Use the RanobeDB API to query its database of light novels and to manage your own lists. This
		API is marked as v0 and is still in development and missing some features.
	</p>
	<p>
		This API is for non-commercial use only and the data is licensed under the <a
			href="https://opendatacommons.org/licenses/odbl/1-0/"
			target="_blank"
			rel="noopener noreferrer">Open Database License</a
		>
		and the
		<a
			href="https://opendatacommons.org/licenses/dbcl/1-0/"
			target="_blank"
			rel="noopener noreferrer">Database Contents License</a
		>.
	</p>
	<p>
		You can visit the <a href="https://discord.com/channels/1252094266650656788/1259922625300529294"
			>#development</a
		>
		channel on our
		<a href="https://discord.gg/ZeAnhGncFx" target="_blank" rel="noopener noreferrer"
			>Discord server</a
		> to ask for any help or if you have any questions.
	</p>
</section>

<section aria-labelledby={anchors.usage}>
	<SectionHeading level={2} id={anchors.usage} label="Usage" />
	<p><strong>API endpoint:</strong> <code>https://ranobedb.org/api/v0</code></p>
	<p>
		Successful responses return <code>200 OK</code> with
		<code>content-type: application/json</code>. Unsuccessful responses use a
		<code>4xx</code>–<code>5xx</code> status code. The response of each endpoint is documented as a TypeScript
		type. Parameters are optional unless marked Required.
	</p>
	<div class="api-summary my-3 grid gap-3 sm:grid-cols-2">
		<p>
			<strong>Read endpoints (no authentication).</strong> Everything under
			<code>/books</code>, <code>/series</code>, <code>/releases</code>,
			<code>/staff</code>, <code>/publishers</code> and <code>/tags</code> is read-only and public.
		</p>
		<p>
			<strong>Write endpoints (authenticated).</strong> Everything under
			<code>/user</code> reads or modifies your own lists and requires a bearer token.
		</p>
	</div>
	<p class="eyebrow" id={anchors.quickstart}>Quickstart</p>
	<p>Fetch two books. This needs no account or token:</p>
	<CodeBlock code={quickstartCurl} id="quickstart-curl" label="Copy quickstart curl" />
	<p class="eyebrow">Example response (trimmed)</p>
	<CodeBlock
		code={quickstartResponse}
		id="quickstart-response"
		label="Copy quickstart example response"
	/>
	<p>
		Next, look up one of these books with <a href={`#${bookEndpointId}`}
			><code>GET /book/48857</code></a
		>, add <code>q</code> to search, or pass <code>page</code> to move through the results.
	</p>
	<p>
		The search params used in the endpoints are similar to the ones used on the website. You can
		visit a page and add some filters to see what the URL search params should look like. For
		example,
		<a
			href="/api/v0/books?q=seishun+buta+yarou&rl=en&rll=or&rf=print&rfl=or&sort=Relevance+desc&staff=195&sl=and&p=41&pl=or"
			><code
				>/books?q=seishun+buta+yarou&rl=en&rll=or&rf=print&rfl=or&sort=Relevance+desc&staff=195&sl=and&p=41&pl=or</code
			></a
		>.
	</p>
	<SectionHeading level={3} id={anchors.filterLogic} label="Logic params" />
	<p>
		Params named <code>rll</code>, <code>rfl</code>,
		<code>sl</code>, <code>pl</code>, <code>til</code> and <code>tel</code> accept
		<code>'and'</code> or <code>'or'</code>. <code>'and'</code> requires every supplied value to
		match; <code>'or'</code> requires at least one. The params below refer to this definition.
	</p>
</section>

<section aria-labelledby={anchors.authentication}>
	<SectionHeading level={2} id={anchors.authentication} label="Authentication" />
	<p>
		Only the <code>/user</code> endpoints require authentication. Create a personal access token in
		your <a href="/settings">account settings</a> and send it in the
		<code>Authorization</code> header:
	</p>
	<CodeBlock
		code="Authorization: Bearer <token>"
		id="authorization-header"
		label="Copy Authorization header"
	/>
	<p>
		A malformed header returns <code>400</code>. A missing or invalid token returns
		<code>401</code>.
	</p>
</section>

<section aria-labelledby={anchors.rateLimits}>
	<SectionHeading level={2} id={anchors.rateLimits} label="Rate limits" />
	<p>There is currently no hard rate limit, but please do not exceed 60 requests per minute.</p>
</section>

<section aria-labelledby={anchors.standardResponses}>
	<SectionHeading level={2} id={anchors.standardResponses} label="Standard responses" />
	<p>
		The <code>/user</code> endpoints share two response shapes, and each endpoint below links back here
		instead of repeating them.
	</p>
	<ul>
		<li>
			<code>PUT</code> on <code>/user/book</code>, <code>/user/series</code>,
			<code>/user/release</code> and <code>/user/staff</code> returns
			<code>&#123; success, action &#125;</code>, where <code>action</code> is
			<code>'add'</code> or <code>'edit'</code>.
		</li>
		<li>
			Every <code>DELETE</code> endpoint, and <code>PUT /user/publisher/[id]</code>, returns
			<code>&#123; success &#125;</code>.
		</li>
	</ul>
	<div class="grid gap-3 sm:grid-cols-2">
		<div>
			<p class="eyebrow">PUT book, series, release, staff</p>
			<CodeBlock
				code={putResponseType}
				id="standard-put-response"
				label="Copy standard PUT response type"
				summary="Show TypeScript type"
				open
			/>
		</div>
		<div>
			<p class="eyebrow">DELETE, and PUT publisher</p>
			<CodeBlock
				code={deleteResponseType}
				id="standard-delete-response"
				label="Copy standard DELETE response type"
				summary="Show TypeScript type"
				open
			/>
		</div>
	</div>
</section>

<style>
	.api-summary p {
		margin: 0;
		padding: 0.75rem 0.875rem;
		background-color: var(--docs-surface);
		border: 1px solid var(--docs-border);
		border-radius: 0.375rem;
	}
</style>
