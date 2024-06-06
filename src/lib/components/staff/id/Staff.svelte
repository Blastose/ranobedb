<script lang="ts">
	import Hr from '$lib/components/layout/Hr.svelte';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import type { Staff, StaffWorks } from '$lib/server/db/staff/staff';
	import type { User } from 'lucia';
	import { getDisplayPrefsContext, getNameDisplay, getNameDisplaySub } from '$lib/display/prefs';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import Works from './Works.svelte';
	import DbExtLink from '$lib/components/db-links/DbExtLink.svelte';
	import {
		bookwalkerAuthorLink,
		pixivLink,
		twitterLink,
		wikidataLink,
	} from '$lib/components/db-links/db-ext-links';
	import DbExtLinkShort from '$lib/components/db-links/DbExtLinkShort.svelte';

	export let staff: Staff;
	export let works: StaffWorks;
	export let user: User | null;
	export let isRevision: boolean;
	export let results: number;
	export let currentPage: number;
	export let totalPages: number;

	const displayPrefs = getDisplayPrefsContext();
</script>

<DBItemShell
	dbItem="staff"
	{isRevision}
	name={getNameDisplay({ obj: staff, prefs: $displayPrefs.names })}
	subName={getNameDisplaySub({ obj: staff, prefs: $displayPrefs.names })}
	{user}
	item={staff}
>
	{#if staff.aliases.length > 0}
		<section>
			<h2 class="text-lg font-bold">Other names</h2>

			{#each staff.aliases as alias}
				<p><NameDisplay obj={alias} /></p>
			{:else}
				<p>No other names</p>
			{/each}
		</section>
	{/if}

	<section>
		<h2 class="text-lg font-bold">Biography</h2>
		{#if staff.description}
			<MarkdownToHtml markdown={staff.description} type="full" />
		{:else}
			<p class="italic mb-2">No biography added</p>
		{/if}
	</section>

	<section>
		<h2 class="text-lg font-bold">Links</h2>
		<div class="flex flex-wrap gap-x-4">
			{#if staff.website}
				<a href={staff.website} target="_blank" class="link">Website</a>
			{/if}
			{#if staff.bookwalker_id}
				<DbExtLinkShort fullLink={{ ...bookwalkerAuthorLink, value: staff.bookwalker_id }} />
			{/if}
			{#if staff.twitter_id}
				<DbExtLinkShort fullLink={{ ...twitterLink, value: staff.twitter_id }} />
			{/if}
			{#if staff.pixiv_id}
				<DbExtLinkShort fullLink={{ ...pixivLink, value: staff.pixiv_id }} />
			{/if}
			{#if staff.wikidata_id}
				<DbExtLinkShort fullLink={{ ...wikidataLink, value: staff.wikidata_id }} />
			{/if}
		</div>
	</section>

	<Hr />

	<div class="mt-2">
		<Works {currentPage} {results} {totalPages} {works} />
	</div>
</DBItemShell>
