<script lang="ts">
	import type { Publisher, PublisherWorks } from '$lib/server/db/publishers/publishers';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import type { User } from '$lib/server/lucia/lucia';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { groupBy } from '$lib/db/array';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { getDisplayPrefsContext, getNameDisplay, getNameDisplaySub } from '$lib/display/prefs';
	import LangFlag from '$lib/components/titles/LangFlag.svelte';
	import Works from './Works.svelte';
	import DbExtLinkShort from '$lib/components/db-links/DbExtLinkShort.svelte';
	import { twitterLink, wikidataLink } from '$lib/components/db-links/db-ext-links';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { userListPublisherSchema } from '$lib/server/zod/schema';
	import FavoritePublisher from '$lib/components/form/publisher/FavoritePublisher.svelte';
	import Collapsible from '$lib/components/display/Collapsible.svelte';
	import { languageNames } from '$lib/db/dbConsts';

	interface Props {
		publisher: Publisher;
		revision: number | undefined;
		works: PublisherWorks;
		user: User | null;
		results: string;
		currentPage: number;
		totalPages: number;
		userListPublisherForm: SuperValidated<Infer<typeof userListPublisherSchema>> | undefined;
	}

	let {
		publisher,
		revision,
		works,
		user,
		results,
		currentPage,
		totalPages,
		userListPublisherForm,
	}: Props = $props();

	let child_publishers = $derived(
		groupBy(publisher.child_publishers, (item) => item.relation_type),
	);

	const displayPrefs = getDisplayPrefsContext();
</script>

<DBItemShell
	dbItem="publisher"
	{revision}
	name={getNameDisplay({ obj: publisher, prefs: $displayPrefs.names })}
	subName={getNameDisplaySub({ obj: publisher, prefs: $displayPrefs.names })}
	{user}
	item={publisher}
>
	{#if user && userListPublisherForm}
		<FavoritePublisher {publisher} {userListPublisherForm}></FavoritePublisher>
	{/if}

	<div class="flex items-center gap-2 text-sm pt-1">
		<span class="font-semibold">Primary language:</span>
		<LangFlag lang={publisher.lang} />
		<span>{languageNames[publisher.lang]}</span>
	</div>

	<section>
		<h2 class="text-lg font-bold">Biography</h2>
		{#if publisher.description}
			<MarkdownToHtml markdown={publisher.description} type="full" />
		{:else}
			<p class="mb-2 italic">No biography added</p>
		{/if}
	</section>

	{#if publisher.aliases}
		<section>
			<Collapsible open={false}>
				{#snippet summary()}
					<h2 class="text-lg font-bold">Aliases</h2>
				{/snippet}
				{#snippet details()}
					<p>{publisher.aliases.split('\n').join(', ')}</p>
				{/snippet}
			</Collapsible>
		</section>
	{/if}

	<section class="flex flex-col gap-1">
		<h2 class="text-lg font-bold">Links</h2>
		{#if publisher.website || publisher.bookwalker || publisher.twitter_id || publisher.wikidata_id}
			<div class="flex flex-wrap gap-x-2 gap-y-2">
				{#if publisher.website}
					<DbExtLinkShort href={publisher.website} name="Website" />
				{/if}
				{#if publisher.bookwalker}
					<DbExtLinkShort href={publisher.bookwalker} name="BookWalker" />
				{/if}
				{#if publisher.twitter_id}
					<DbExtLinkShort fullLink={{ ...twitterLink, value: publisher.twitter_id }} />
				{/if}
				{#if publisher.wikidata_id}
					<DbExtLinkShort fullLink={{ ...wikidataLink, value: publisher.wikidata_id }} />
				{/if}
			</div>
		{:else}
			<p class="italic">No links added</p>
		{/if}
	</section>

	{#if Object.entries(child_publishers).length > 0}
		<section>
			<h2 class="text-lg font-bold">Related publishers</h2>
			{#each Object.entries(child_publishers) as [key, publishers]}
				<div class="flex flex-wrap gap-x-4">
					<h3 class="font-semibold capitalize">{key}:</h3>
					{#each publishers as publisher, index (publisher.id)}
						<span>
							<a class="link" href="/publisher/{publisher.id}"><NameDisplay obj={publisher} /></a
							>{#if index < publishers.length - 1},{/if}
						</span>
					{/each}
				</div>
			{/each}
		</section>
	{/if}

	<Hr />

	<div class="mt-2">
		<Works {currentPage} {results} {totalPages} {works} publisherId={publisher.id} />
	</div>
</DBItemShell>
