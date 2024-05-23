<script lang="ts">
	import { DateNumber } from '$lib/components/form/release/releaseDate';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import { languageNames } from '$lib/db/dbTypes';
	import type { Release } from '$lib/server/db/releases/releases';
	import type { User } from 'lucia';

	export let release: Release;
	export let isRevision: boolean;
	export let user: User | null;
</script>

<DBItemShell
	dbItem="release"
	{isRevision}
	name={release.title}
	subName={release.romaji}
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
		<div>
			<h2 class="text-lg font-bold">Publishers</h2>
			<div>
				{#each release.publishers as publisher}
					<p>
						<a class="link" href="/publisher/{publisher.id}"
							>{publisher.name} - {publisher.publisher_type}</a
						>
					</p>
				{/each}
			</div>
		</div>
	{/if}

	{#if release.books.length > 0}
		<div>
			<h2 class="text-lg font-bold">Book relations</h2>
			<div>
				{#each release.books as book}
					<p>
						<a class="link" href="/book/{book.id}">{book.title}</a>
					</p>
				{/each}
			</div>
		</div>
	{/if}
</DBItemShell>

<style>
	dl > div {
		display: grid;
		grid-template-columns: 100px 1fr;
	}
</style>
