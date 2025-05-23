<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book.js';
	import Book from '$lib/components/book/id/Book.svelte';
	import Revision from '$lib/components/history/Revision.svelte';
	import RevisionContainer from '$lib/components/history/RevisionContainer.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	let { data } = $props();

	const displayPrefs = getDisplayPrefsContext();
	let book = $derived(data.book);
	let title = $derived(getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs }));

	function buildBaseLink() {
		return `/book/${data.bookId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />
<MetaTags
	{title}
	image={buildImageUrl(book.image?.filename)}
	description={book.description}
	site_name={'RanobeDB'}
/>
<NoIndex />

<main class="container-rndb flex flex-col gap-6">
	<RevisionContainer hideHr={true}>
		{#snippet revision()}
			<Revision
				changes={data.changes}
				{title}
				{buildBaseLink}
				diffs={data.diffs}
				currentItemVisibility={data.currentItemVisibility}
			/>
		{/snippet}

		{#snippet content()}
			<div>
				<Book
					book={{ ...book, id: data.bookId }}
					book_series={data.book_series}
					user={data.user}
					revision={data.revision.revision}
				/>
			</div>
		{/snippet}
	</RevisionContainer>
</main>
