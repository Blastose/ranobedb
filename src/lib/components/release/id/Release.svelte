<script lang="ts">
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import { languageNames } from '$lib/db/dbConsts';
	import type { Release } from '$lib/server/db/releases/releases';
	import type { User } from '$lib/server/lucia/lucia';
	import { getDisplayPrefsContext, getNameDisplay, getNameDisplaySub } from '$lib/display/prefs';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import BookImage from '$lib/components/book/BookImage.svelte';
	import ReleaseOptions from '$lib/components/book/id/ReleaseOptions.svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { userListReleaseSchema } from '$lib/server/zod/schema';
	import BookImageBadge from '$lib/components/book/BookImageBadge.svelte';

	export let release: Release;
	export let revision: number | undefined;
	export let user: User | null;
	export let userListReleaseForm: SuperValidated<Infer<typeof userListReleaseSchema>> | undefined =
		undefined;

	const displayPrefs = getDisplayPrefsContext();
</script>

<DBItemShell
	dbItem="release"
	{revision}
	name={getNameDisplay({ obj: release, prefs: $displayPrefs.names })}
	subName={getNameDisplaySub({ obj: release, prefs: $displayPrefs.names })}
	{user}
	item={release}
	copyTo={{ to: ['book'] }}
>
	{#if userListReleaseForm !== undefined}
		<dl>
			<div>
				<dt>List status</dt>
				<dd>
					<ReleaseOptions
						{release}
						{userListReleaseForm}
						showStatus={true}
						placement={'bottom-start'}
					/>
				</dd>
			</div>
		</dl>
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

	{#if release.description}
		<section>
			<h2 class="font-bold">Note</h2>
			<MarkdownToHtml markdown={release.description} type="full" />
		</section>
	{/if}

	<section>
		<h2 class="text-lg font-bold">Links</h2>
		{#if release.website || release.amazon || release.bookwalker || release.rakuten}
			<div class="flex flex-wrap gap-x-4">
				{#if release.website}
					<a href={release.website} target="_blank" class="link">Website</a>
				{/if}
				{#if release.amazon}
					<a href={release.amazon} target="_blank" class="link">Amazon</a>
				{/if}
				{#if release.bookwalker}
					<a href={release.bookwalker} target="_blank" class="link">Bookwalker</a>
				{/if}
				{#if release.rakuten}
					<a href={release.rakuten} target="_blank" class="link">Rakuten</a>
				{/if}
			</div>
		{:else}
			<p class="italic">No links added</p>
		{/if}
	</section>

	{#if release.publishers.length > 0}
		<section>
			<h2 class="text-lg font-bold">Publishers</h2>
			<p>
				{#each release.publishers as publisher, index (publisher.id)}
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
		<h2 class="text-lg font-bold">Book relations</h2>

		{#if release.books.length > 0}
			<BookImageContainer moreColumns={true}>
				{#each release.books as book (book.id)}
					<BookImage {book} urlPrefix="/book/">
						{#if book.label}
							<BookImageBadge badges={[book.label.label]} location="top-right" />
						{/if}
					</BookImage>
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
