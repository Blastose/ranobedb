<script lang="ts">
	import Hr from '$lib/components/layout/Hr.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	let { data } = $props();
</script>

<PageTitle title="API" />

<main class="container-rndb flex flex-col gap-2">
	<h1 class="text-4xl font-bold">RanobeDB API v0</h1>

	<div class="markdown">
		<section>
			<h2>Introduction</h2>
			<p>
				This page describes the use of RanobeDB's public API to query information from its database.
				This API is marked as v0 and is still in development and missing some features.
			</p>
			<p>
				This API is for non-commercial use only and the data is licensed under the <a
					href="https://opendatacommons.org/licenses/odbl/1-0/"
					target="_blank">Open Database License</a
				>
				and the
				<a href="https://opendatacommons.org/licenses/dbcl/1-0/" target="_blank"
					>Database Contents License</a
				>.
			</p>
			<p>
				You can visit the <a
					href="https://discord.com/channels/1252094266650656788/1259922625300529294"
					class="link">#development</a
				>
				channel on our <a href="https://discord.gg/ZeAnhGncFx" target="_blank">Discord server</a> to
				ask for any help or if you have any questions.
			</p>
		</section>

		<section>
			<h2>Usage</h2>
			<p><strong>API endpoint:</strong> <code>https://ranobedb.org/api/v0</code></p>
			<p>
				Successful responses will return <code>200 OK</code> with
				<code>content-type: application/json</code>. An unsuccessful response will have a
				<code>4xx - 5xx</code> code.
			</p>
			<p>The responses of each endpoint are given as TypeScript types.</p>
			<p>
				The search params used in the endpoints are similar to the ones used on the website. You can
				visit a page and add some filters to see what the url search params should look like. For
				example, <a
					href="/api/v0/books?q=seishun+buta+yarou&rl=en&rll=or&rf=print&rfl=or&sort=Relevance+desc&staff=195&sl=and&p=41&pl=or"
					><code
						>/books?q=seishun+buta+yarou&rl=en&rll=or&rf=print&rfl=or&sort=Relevance+desc&staff=195&sl=and&p=41&pl=or</code
					></a
				>.
			</p>
			<p>
				There are currently no rate-limits, but please do not exceed over 60 requests in 1 minute.
			</p>
			<p>
				The API currently only supports read-only endpoints. Other features (like user lists) may be
				added in the feature.
			</p>
		</section>

		<div class="mt-4">
			<Hr />
		</div>

		<section class="api-docs mt-6">
			<h2>Database querying</h2>
			<section>
				<h3>Common types</h3>
				<div class="params">
					<span>Language</span>
					<span>
						'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'fr' | 'es' | 'ko' | 'ar' | 'bg' | 'ca' | 'cs' |
						'ck' | 'da' | 'de' | 'el' | 'eo' | 'eu' | 'fa' | 'fi' | 'ga' | 'gd' | 'he' | 'hi' | 'hr'
						| 'hu' | 'id' | 'it' | 'iu' | 'mk' | 'ms' | 'la' | 'lt' | 'lv' | 'nl' | 'no' | 'pl' |
						'pt-pt' | 'pt-br' | 'ro' | 'ru' | 'sk' | 'sl' | 'sr' | 'sv' | 'ta' | 'th' | 'tr' | 'uk'
						| 'ur' | 'vi'</span
					>
				</div>
			</section>
			<section>
				<h3>Books</h3>
				<section>
					<h4>GET /books</h4>
					<section>
						<h5>Params</h5>
						<div class="params">
							<span>q</span>
							<span>string</span>

							<span>page</span>
							<span>number</span>

							<span>limit</span>
							<span>number <span>Default 24; Max: 100</span></span>

							<span>rl</span>
							<span>Language[] <span>Release lanuages</span></span>

							<span>rll</span>
							<span>'and' | 'or' <span>Release lanuages logic</span></span>

							<span>rf</span>
							<span>('digital' | 'print' | 'audio')[] <span>Release formats</span></span>

							<span>rfl</span>
							<span>'and' | 'or' <span>Release formats logic</span></span>

							<span>staff</span>
							<span>number[] <span>The id of staff</span></span>

							<span>sl</span>
							<span>'and' | 'or' <span>Staff logic</span></span>

							<span>p</span>
							<span>number[] <span>The id of publishers</span></span>

							<span>pl</span>
							<span>'and' | 'or' <span>Publisher logic</span></span>

							<span>sort</span>
							<span
								>'Relevance desc' | 'Relevance asc' | 'Title asc' | 'Title desc' | 'Release date
								asc' | 'Release date desc'</span
							>
						</div>
					</section>
					<section>
						<h5>Response</h5>
						<pre>{data.booksResponse}</pre>
					</section>
				</section>
				<section>
					<h4>GET /book/[id]</h4>
					<section>
						<h5>Response</h5>
						<pre>{data.bookResponse}</pre>
					</section>
				</section>
			</section>
			<section>
				<h3>Series</h3>
				<section>
					<h4>GET /series</h4>
					<section>
						<h5>Params</h5>
						<div class="params">
							<span>q</span>
							<span>string</span>

							<span>page</span>
							<span>number</span>

							<span>limit</span>
							<span>number <span>Default 24; Max: 100</span></span>

							<span>pubStatus</span>
							<span>'ongoing' | 'completed' | 'hiatus' | 'stalled' | 'cancelled' | 'unknown'</span>

							<span>genresInclude</span>
							<span>number[]</span>

							<span>genresExclude</span>
							<span>number[]</span>

							<span>tagsInclude</span>
							<span>number[]</span>

							<span>tagsExclude</span>
							<span>number[]</span>

							<span>til</span>
							<span>'and' | 'or' <span>Tags include logic</span></span>

							<span>tel</span>
							<span>'and' | 'or' <span>Tags exclude logic</span></span>

							<span>rl</span>
							<span>Language[] <span>Release lanuages</span></span>

							<span>rll</span>
							<span>'and' | 'or' <span>Release lanuages logic</span></span>

							<span>rf</span>
							<span>('digital' | 'print' | 'audio')[] <span>Release formats</span></span>

							<span>rfl</span>
							<span>'and' | 'or' <span>Release formats logic</span></span>

							<span>staff</span>
							<span>number[] <span>The id of staff</span></span>

							<span>sl</span>
							<span>'and' | 'or' <span>Staff logic</span></span>

							<span>p</span>
							<span>number[] <span>The id of publishers</span></span>

							<span>pl</span>
							<span>'and' | 'or' <span>Publisher logic</span></span>

							<span>sort</span>
							<span>
								'Relevance desc' | 'Relevance asc' | 'Title asc' | 'Title desc' | 'Start date asc' |
								'Start date desc' | 'End date asc' | 'End date desc' | 'Num. books asc' | 'Num.
								books desc'</span
							>
						</div>
					</section>
					<section>
						<h5>Response</h5>
						<pre>{data.seriesResponse}</pre>
					</section>
				</section>
				<section>
					<h4>GET /series/[id]</h4>
					<section>
						<h5>Response</h5>
						<pre>{data.seriesOneResponse}</pre>
					</section>
				</section>
			</section>
			<section>
				<h3>Releases</h3>
				<section>
					<h4>GET /releases</h4>
					<section>
						<h5>Params</h5>
						<div class="params">
							<span>q</span>
							<span>string</span>

							<span>page</span>
							<span>number</span>

							<span>limit</span>
							<span>number <span>Default 24; Max: 100</span></span>

							<span>rl</span>
							<span>Language[] <span>Release lanuages</span></span>

							<span>rll</span>
							<span>'and' | 'or' <span>Release lanuages logic</span></span>

							<span>rf</span>
							<span>('digital' | 'print' | 'audio')[] <span>Release formats</span></span>

							<span>rfl</span>
							<span>'and' | 'or' <span>Release formats logic</span></span>

							<span>p</span>
							<span>number[] <span>The id of publishers</span></span>

							<span>pl</span>
							<span>'and' | 'or' <span>Publisher logic</span></span>

							<span>minDate</span>
							<span>ISO date <span>E.g. 2025-01-01</span></span>

							<span>maxDate</span>
							<span>ISO date <span>E.g. 2025-01-01</span></span>

							<span>sort</span>
							<span>
								'Relevance desc' | 'Relevance asc' | 'Title asc' | 'Title desc' | 'Release date asc'
								| 'Release date desc' | 'Pages asc' | 'Pages desc'</span
							>
						</div>
					</section>
					<section>
						<h5>Response</h5>
						<pre>{data.releasesResponse}</pre>
					</section>
				</section>
				<section>
					<h4>GET /release/[id]</h4>
					<section>
						<h5>Response</h5>
						<pre>{data.releaseResponse}</pre>
					</section>
				</section>
			</section>
			<section>
				<h3>Staff</h3>
				<section>
					<h4>GET /staff</h4>
					<section>
						<h5>Params</h5>
						<div class="params">
							<span>q</span>
							<span>string</span>

							<span>page</span>
							<span>number</span>

							<span>limit</span>
							<span>number (max 100)</span>
						</div>
					</section>
					<section>
						<h5>Response</h5>
						<pre>{data.staffResponse}</pre>
					</section>
				</section>
				<section>
					<h4>GET /staff/[id]</h4>
					<section>
						<h5>Response</h5>
						<pre>{data.staffOneResponse}</pre>
					</section>
				</section>
			</section>
			<section>
				<h3>Publishers</h3>
				<section>
					<h4>GET /publishers</h4>
					<section>
						<h5>Params</h5>
						<div class="params">
							<span>q</span>
							<span>string</span>

							<span>page</span>
							<span>number</span>

							<span>limit</span>
							<span>number (max 100)</span>
						</div>
					</section>
					<section>
						<h5>Response</h5>
						<pre>{data.publishersResponse}</pre>
					</section>
				</section>
				<section>
					<h4>GET /publisher/[id]</h4>
					<section>
						<h5>Response</h5>
						<pre>{data.publisherResponse}</pre>
					</section>
				</section>
			</section>
			<section>
				<h3>Tags</h3>
				<section>
					<h4>GET /tags</h4>
					<section>
						<h5>Params</h5>
						<div class="params">
							<span>q</span>
							<span>string</span>

							<span>page</span>
							<span>number</span>

							<span>limit</span>
							<span>number (max 100)</span>
						</div>
					</section>
					<section>
						<h5>Response</h5>
						<pre>{data.tagsResponse}</pre>
					</section>
				</section>
			</section>
		</section>
	</div>
</main>

<style>
	.api-docs {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.api-docs .params {
		display: grid;
		grid-template-columns: 125px 1fr;
	}

	.params {
		background-color: rgb(216, 216, 228);
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		margin: 0.25rem 0rem;
		font-size: 0.875rem;
	}

	:global(.dark) .params {
		background-color: rgb(49, 49, 51);
	}

	.params span:nth-child(even) {
		display: flex;
		flex-direction: column;
	}
	.params span:nth-child(even) > span {
		color: #7f7d86;
		font-size: 0.75rem;
	}
	:global(.dark) .params span:nth-child(even) > span {
		color: #a3a3ad;
	}
</style>
