<script lang="ts">
	import Book from '$lib/components/book/id/Book.svelte';
	import Revision from '$lib/components/history/Revision.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: book = data.book;
	$: diff = data.diff;
	$: title = book.title ?? book.title_orig ?? '';

	function buildBaseLink() {
		return `/book/${data.bookId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />

<div>
	<div class="container-rndb">
		<Revision changes={data.changes} {title} {buildBaseLink} diff={JSON.stringify(diff)} />
	</div>

	<div class="mt-[150px]">
		<Book {book} theme={data.theme} user={data.user} isRevision={true} />
	</div>
</div>
