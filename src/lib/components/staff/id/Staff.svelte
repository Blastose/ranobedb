<script lang="ts">
	import Hr from '$lib/components/layout/Hr.svelte';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import type { Staff } from '$lib/server/db/staff/staff';
	import type { User } from 'lucia';

	export let staff: Staff;
	export let user: User | null;
	export let isRevision: boolean;
</script>

<DBItemShell
	dbItem="staff"
	{isRevision}
	name={staff.name}
	subName={staff.romaji}
	{user}
	item={staff}
>
	{#if staff.aliases.length > 0}
		<section>
			<h2 class="text-lg font-bold">Other names</h2>

			{#each staff.aliases as alias}
				<p>{alias.name}</p>
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

	<Hr />

	<section>
		<h2 class="text-lg font-bold">Links</h2>
		{#if staff.bookwalker_id}
			<a class="link" target="_blank" href="https://bookwalker.jp/author/{staff.bookwalker_id}"
				>Bookwalker</a
			>
		{/if}
	</section>

	<section>
		<h2 class="text-lg font-bold">Books</h2>
		{#each staff.books as book}
			<p><a href="/book/{book.id}">{book.title} - {book.role_type} - as {book.name}</a></p>
		{:else}
			<p class="italic">None</p>
		{/each}
	</section>
</DBItemShell>
