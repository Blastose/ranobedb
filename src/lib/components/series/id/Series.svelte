<script lang="ts">
	import Hr from '$lib/components/layout/Hr.svelte';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import type { Series } from '$lib/server/db/series/series';
	import type { User } from 'lucia';

	export let series: Series;
	export let user: User | null;
	export let isRevision: boolean;
</script>

<DBItemShell
	dbItem="series"
	{isRevision}
	name={series.title ?? ''}
	subName={series.romaji || series.title_orig}
	{user}
	item={series}
>
	<Hr />

	<section>
		<h2 class="text-lg font-bold">Books</h2>
		{#each series.books as book}
			<p><a href="/book/{book.id}">{book.title}</a></p>
		{:else}
			<p class="italic">None</p>
		{/each}
	</section>

	<p>Status: {series.publication_status}</p>
</DBItemShell>
