<script lang="ts">
	import Book from '$lib/components/book/id/Book.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: book = data.book;
</script>

<PageTitle title={book.title ?? book.title_orig ?? ''} />

<Book {book} userListForm={data.userListForm} theme={data.theme} user={data.user} />
