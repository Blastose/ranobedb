<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book.js';
	import Book from '$lib/components/book/id/Book.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	let { data } = $props();

	const displayPrefs = getDisplayPrefsContext();
	let book = $derived(data.book);
	let book_series = $derived(data.book_series);
	let title = $derived(getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs }));
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
		allCustLabels={data.allCustLabels}
	/>
</main>
