<script lang="ts">
	import Book from '$lib/components/book/id/Book.svelte';
	import Revision from '$lib/components/history/Revision.svelte';
	import RevisionContainer from '$lib/components/history/RevisionContainer.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: book = data.book;
	$: title = getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs });

	function buildBaseLink() {
		return `/book/${data.bookId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />

<div class="container-rndb flex flex-col gap-6">
	<RevisionContainer hideHr={true}>
		<svelte:fragment slot="revision">
			<Revision changes={data.changes} {title} {buildBaseLink} diffs={data.diffs} />
		</svelte:fragment>

		<div slot="content" class="mt-[150px]">
			<Book
				book={{ ...book, id: data.bookId }}
				user={data.user}
				revision={data.revision.revision}
			/>
		</div>
	</RevisionContainer>
</div>
