<script lang="ts">
	import History from '$lib/components/history/History.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';

	export let data;

	$: changes = data.changes;
	$: book = data.book;

	$: title = `Edit history of ${book.title ?? book.title_orig ?? ''}`;

	function buildRevisionLink(item_id: number, revision: number) {
		return `/book/${item_id}/revision/${revision}`;
	}
</script>

<PageTitle {title} />

<main class="container-rndb">
	<History {changes} {title} {buildRevisionLink} />
</main>
