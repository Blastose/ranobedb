<script lang="ts">
	import type { Publisher, PublisherBook } from '$lib/server/db/publishers/publishers';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import type { User } from 'lucia';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import { groupBy } from '$lib/db/array';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import BookImage from '$lib/components/book/BookImage.svelte';
	import NameDisplay from '$lib/components/display/NameDisplay.svelte';
	import { getDisplayPrefsContext, getNameDisplay, getNameDisplaySub } from '$lib/display/prefs';

	export let publisher: Publisher;
	export let isRevision: boolean;
	export let books: Array<PublisherBook>;
	export let user: User | null;
	export let results: number;
	export let currentPage: number;
	export let totalPages: number;

	$: child_publishers = groupBy(publisher.child_publishers, (item) => item.relation_type);

	const displayPrefs = getDisplayPrefsContext();
</script>

<DBItemShell
	dbItem="publisher"
	{isRevision}
	name={getNameDisplay({ obj: publisher, prefs: $displayPrefs.names })}
	subName={getNameDisplaySub({ obj: publisher, prefs: $displayPrefs.names })}
	{user}
	item={publisher}
>
	<section>
		<h2 class="text-lg font-bold">Biography</h2>
		{#if publisher.description}
			<MarkdownToHtml markdown={publisher.description} type="full" />
		{:else}
			<p class="italic mb-2">No biography added</p>
		{/if}
	</section>

	{#if Object.entries(child_publishers).length > 0}
		<section>
			<h2 class="font-bold text-lg">Related publishers</h2>
			{#each Object.entries(child_publishers) as [key, publishers]}
				<div class="flex flex-wrap gap-x-4">
					<h3 class="font-semibold capitalize">{key}:</h3>
					{#each publishers as publisher, index}
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

	<section class="flex flex-col gap-2">
		<h2 class="text-lg font-bold">Books</h2>
		<PaginationContainer
			{currentPage}
			{totalPages}
			results={books.length > 0 ? results : undefined}
		>
			{#if books.length > 0}
				<BookImageContainer moreColumns={true}>
					{#each books as book}
						<BookImage {book} urlPrefix="/book/" />
					{/each}
				</BookImageContainer>
			{:else}
				<p class="italic">None</p>
			{/if}
		</PaginationContainer>
	</section>

	<section>
		<h2 class="text-lg font-bold">Releases</h2>
		{#each publisher.releases as release}
			<p>
				<a class="link" href="/release/{release.id}">{release.title} - {release.release_date}</a>
			</p>
		{/each}
	</section>
</DBItemShell>
