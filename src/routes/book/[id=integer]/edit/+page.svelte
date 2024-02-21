<script lang="ts">
	import BookForm from '$lib/components/form/book/BookForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: book = data.book;
</script>

<PageTitle title="Editing {book.title ?? book.title_orig ?? ''}" />

<div>
	<BookForm bookForm={data.form} type="edit" />
</div>
