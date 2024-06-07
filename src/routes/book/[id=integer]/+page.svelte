<script lang="ts">
	import Book from '$lib/components/book/id/Book.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: book = data.book;
	$: title = getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs });
</script>

<PageTitle {title} />

<Book {book} userListForm={data.userListForm} user={data.user} revision={undefined} />
