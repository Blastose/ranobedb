<script lang="ts">
	import BookForm from '$lib/components/form/book/BookForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;
</script>

<PageTitle title="Add book" />

<main class="container-rndb">
	<BookForm
		bookForm={data.form}
		book={undefined}
		type="add"
		user={data.user}
		actionUrl="/books/add"
	/>
</main>
