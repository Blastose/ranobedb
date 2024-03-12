<script lang="ts">
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
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
	<div>
		<p>Format: {release.format}</p>
		<p>Released: {release.release_date}</p>
	</div>

	<div>
		<h2 class="text-lg font-bold">Publishers</h2>
		<div>
			{#each release.publishers as publisher}
				<p>
					<a href="/publisher/{publisher.id}">{publisher.name} - {publisher.publisher_type}</a>
				</p>
			{/each}
		</div>
	</div>

	<div>
		<h2 class="text-lg font-bold">Book relations</h2>
		<div>
			{#each release.books as book}
				<a href="/book/{book.id}">{book.title}</a>
			{/each}
		</div>
	</div>
</DBItemShell>
