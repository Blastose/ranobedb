<script lang="ts">
	import BookImage from '$lib/components/book/BookImage.svelte';
	import Hr from '$lib/components/layout/Hr.svelte';
	import BookImageContainer from '$lib/components/layout/container/BookImageContainer.svelte';
	import DBItemShell from '$lib/components/layout/db/DBItemShell.svelte';
	import MarkdownToHtml from '$lib/components/markdown/MarkdownToHtml.svelte';
	import PaginationContainer from '$lib/components/pagination/PaginationContainer.svelte';
	import type { Staff, StaffBook } from '$lib/server/db/staff/staff';
	import type { User } from 'lucia';

	export let staff: Staff;
	export let books: Array<StaffBook>;
	export let user: User | null;
	export let isRevision: boolean;
	export let results: number;
	export let currentPage: number;
	export let totalPages: number;
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
</DBItemShell>
