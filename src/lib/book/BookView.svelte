<script lang="ts">
	import type BookInfo from '$lib/models/bookInfo';
	import BookCardContainer from './BookCardContainer.svelte';
	import BookTable from './BookTable.svelte';
	import View from '$lib/models/view';
	import ViewSelect from '$lib/book/ViewSelect.svelte';
	import { booksView } from '$lib/stores/booksViewStore';
	import BookImageContainer from './BookImageContainer.svelte';

	export let books: BookInfo[];
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<p>{books.length} books</p>
		<ViewSelect />
	</div>
	{#if $booksView === View.card}
		<BookCardContainer {books} />
	{:else if $booksView === View.table}
		<BookTable {books} />
	{:else if $booksView === View.picture}
		<BookImageContainer {books} />
	{/if}
</div>
