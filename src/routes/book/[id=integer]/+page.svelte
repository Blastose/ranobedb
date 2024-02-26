<script lang="ts">
	import Book from '$lib/components/book/id/Book.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/stores';
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import { onMount } from 'svelte';
	import DeletedItem from '$lib/components/forbidden/DeletedItem.svelte';

	const flash = getFlash(page);

	export let data;

	$: book = data.book;

	onMount(() => {
		if ($flash) {
			addToast({ data: { title: $flash.message, type: $flash.type } });
		}
		$flash = undefined;
	});
</script>

<!-- TODO use discriminated unions in Svelte 5 -->
{#if book}
	<PageTitle title={book.title ?? book.title_orig ?? ''} />

	<Book
		{book}
		userListForm={data.userListForm}
		theme={data.theme}
		user={data.user}
		isRevision={false}
	/>
{:else}
	<DeletedItem title={data.title ?? ''} reason={data.reason ?? ''} />
{/if}
