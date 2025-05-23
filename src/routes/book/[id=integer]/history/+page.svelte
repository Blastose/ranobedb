<script lang="ts">
	import HistoryPaged from '$lib/components/history/HistoryPaged.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	let { data } = $props();

	let changes = $derived(data.changes);
	let book = $derived(data.book);

	const displayPrefs = getDisplayPrefsContext();

	let title = $derived(
		`Edit history of ${getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs })}`,
	);
</script>

<PageTitle {title} />
<NoIndex />

<main class="container-rndb">
	<HistoryPaged {changes} {title} currentPage={data.currentPage} totalPages={data.totalPages} />
</main>
