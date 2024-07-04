<script lang="ts">
	import { page } from '$app/stores';
	import { buildImageUrl } from '$lib/components/book/book.js';
	import Book from '$lib/components/book/id/Book.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: book = data.book;
	$: title = getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs });
</script>

<PageTitle {title} />

<MetaTags
	{title}
	image={buildImageUrl(book.image?.filename)}
	url={$page.url.toString()}
	description={book.description}
	site_name={'RanobeDB'}
/>

<Book {book} userListForm={data.userListForm} user={data.user} revision={undefined} />
