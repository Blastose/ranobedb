<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book.js';
	import Book from '$lib/components/book/id/Book.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: book = data.book;
	$: book_series = data.book_series;
	$: title = getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs });
</script>

<PageTitle {title} />
<MetaTags
	{title}
	image={buildImageUrl(book.image?.filename)}
	description={book.description}
	site_name={'RanobeDB'}
/>

<main class="container-rndb -mt-32">
	<Book
		{book}
		{book_series}
		userListForm={data.userListForm}
		userListReleaseForm={data.userListReleaseForm}
		user={data.user}
		revision={undefined}
	/>
</main>
