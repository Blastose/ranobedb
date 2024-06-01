<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import { languageNames } from '$lib/db/dbConsts';
	import type { Release } from '$lib/server/db/releases/releases';
	import type { User } from 'lucia';
	import { getDisplayPrefsContext, getNameDisplay, getNameDisplaySub } from '$lib/display/prefs';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import BookImage from '$lib/components/book/BookImage.svelte';

	export let release: Release;
	export let isRevision: boolean;
	export let user: User | null;

	const displayPrefs = getDisplayPrefsContext();
</script>

<DBItemShell
	dbItem="release"
	{isRevision}
	name={getNameDisplay({ obj: release, prefs: $displayPrefs.names })}
	subName={getNameDisplaySub({ obj: release, prefs: $displayPrefs.names })}
	{user}
	item={release}
>
	{#if release.description}
		<section>
			<h2 class="text-lg font-bold">Note</h2>
			<MarkdownToHtml markdown={release.description} type="full" />
		</section>
	{/if}

	<dl>
		<div>
			<dt>Released</dt>
			<dd>{new DateNumber(release.release_date).getDateFormatted()}</dd>
		</div>

		<div>
			<dt>Language</dt>
			<dd>{languageNames[release.lang]}</dd>
		</div>

		<div>
			<dt>Format</dt>
			<dd>{release.format}</dd>
		</div>

		{#if release.isbn13}
			<div>
				<dt>ISBN13</dt>
				<dd>{release.isbn13}</dd>
			</div>
		{/if}

		{#if release.pages}
			<div>
				<dt>Pages</dt>
				<dd>{release.pages}</dd>
			</div>
		{/if}
	</dl>

	{#if release.publishers.length > 0}
		<section>
			<h2 class="text-lg font-bold">Publishers</h2>
			<p>
				{#each release.publishers as publisher, index}
					<span>
						<a class="link" href="/publisher/{publisher.id}"><NameDisplay obj={publisher} /></a>
						<span class="text-xs">{publisher.publisher_type}</span
						>{#if index !== release.publishers.length - 1}<span>,</span>{/if}
					</span>
				{/each}
			</p>
		</section>
	{/if}

	<section class="flex flex-col gap-2">
		<h2 class="text-lg font-bold">Books relations</h2>

		{#if release.books.length > 0}
			<BookImageContainer moreColumns={true}>
				{#each release.books as book}
					<BookImage {book} urlPrefix="/book/" />
				{/each}
			</BookImageContainer>
		{:else}
			<p class="italic">None</p>
		{/if}
	</section>
</DBItemShell>

<style>
	dl > div {
		display: grid;
		grid-template-columns: 100px 1fr;
	}

	dt {
		font-weight: 700;
	}
</style>
