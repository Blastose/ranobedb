<script lang="ts">
	import Hr from '$lib/components/layout/Hr.svelte';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import type { Series } from '$lib/server/db/series/series';
	import type { User } from 'lucia';
	import { groupBy } from '$lib/db/array';

	export let series: Series;
	export let user: User | null;
	export let isRevision: boolean;

	$: child_series = groupBy(series.child_series, (item) => item.relation_type);
</script>

<DBItemShell
	dbItem="series"
	{isRevision}
	name={series.title ?? ''}
	subName={series.romaji}
	{user}
	item={series}
>
	<div class="flex gap-2">
		<dt>Publication status:</dt>
		<dd>{series.publication_status}</dd>
	</div>

	<Hr />

	<section>
		<h2 class="text-lg font-bold">Books in series</h2>
		{#each series.books as book, index}
			<p>#{index + 1}. <a class="link" href="/book/{book.id}">{book.title}</a></p>
		{:else}
			<p class="italic">None</p>
		{/each}
	</section>

	{#if Object.entries(child_series).length > 0}
		<section>
			<h2 class="font-bold text-lg">Related series</h2>
			<div class="flex flex-col gap-1">
				{#each Object.entries(child_series) as [key, series]}
					<div class="flex flex-col">
						<h3 class="font-semibold capitalize">{key}:</h3>
						{#each series as serie}
							<a class="link" href="/series/{serie.id}">{serie.title}</a>
						{/each}
					</div>
				{/each}
			</div>
		</section>
	{/if}
</DBItemShell>
