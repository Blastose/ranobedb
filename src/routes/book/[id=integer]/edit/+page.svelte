<script lang="ts">
	import BookForm from '$lib/components/form/book/BookForm.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: book = data.book;
	$: title = getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs });
</script>

<PageTitle title="Editing {title}" />
<NoIndex />

<main class="container-rndb">
	<BookForm bookForm={data.form} {book} type="edit" user={data.user} />
</main>
