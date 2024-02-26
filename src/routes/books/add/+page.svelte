<script lang="ts">
	import AccessDenied from '$lib/components/forbidden/AccessDenied.svelte';
	import BookForm from '$lib/components/form/book/BookForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;
</script>

<PageTitle title="Add book" />

<main class="container-rndb">
	{#if data.canEdit}
		<BookForm bookForm={data.form} book={undefined} type="add" />
	{:else}
		<AccessDenied />
	{/if}
</main>
