<script lang="ts">
	import VisibilityDisplay from '$lib/components/layout/db/VisibilityDisplay.svelte';
	import VisibilityDisplayPerm from '$lib/components/layout/db/VisibilityDisplayPerm.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import type { Staff } from '$lib/server/db/staff/staff';
	import type { User } from 'lucia';

	export let staff: Staff;
	export let user: User | null;
	export let isRevision: boolean;
</script>

<section>
	<p class="font-medium opacity-80">Staff</p>
	<div class="flex justify-between items-center">
		<div class="flex flex-col">
			<h1 class="text-2xl font-bold">
				{staff.name}
			</h1>
			{#if staff.romaji}
				<p class="opacity-75">{staff.romaji}</p>
			{/if}
		</div>

		{#if !isRevision}
			<section class="whitespace-nowrap">
				<VisibilityDisplay item={staff} type="staff" {user} />
			</section>
		{/if}
	</div>

	<section class="mt-2">
		<VisibilityDisplayPerm item={staff} {user} />
	</section>

	{#if staff.aliases.length > 0}
		<section class="mt-2">
			<h2 class="text-lg font-bold">Other names</h2>

			{#each staff.aliases as alias}
				<p>{alias.name}</p>
			{:else}
				<p>No other names</p>
			{/each}
		</section>
	{/if}

	<section class="mt-2">
		<h2 class="text-lg font-bold">Biography</h2>
		{#if staff.description}
			<MarkdownToHtml markdown={staff.description} type="full" />
		{:else}
			<p class="italic">No biography added</p>
		{/if}
	</section>

	<section class="mt-2">
		<h2 class="text-lg font-bold">Links</h2>
		{#if staff.bookwalker_id}
			<a class="link" target="_blank" href="https://bookwalker.jp/author/{staff.bookwalker_id}"
				>Bookwalker</a
			>
		{/if}
	</section>

	<section class="mt-2">
		<h2 class="text-lg font-bold">Books</h2>
		{#each staff.books as book}
			<p><a href="/book/{book.id}">{book.title} - {book.role_type} - as {book.name}</a></p>
		{:else}
			<p class="italic">None</p>
		{/each}
	</section>
</section>
