<script lang="ts">
	import HistoryPaged from '$lib/components/history/HistoryPaged.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	export let data;

	$: changes = data.changes;
	$: book = data.book;

	const displayPrefs = getDisplayPrefsContext();

	$: title = `Edit history of ${getTitleDisplay({ obj: book, prefs: $displayPrefs.title_prefs })}`;
</script>

<PageTitle {title} />

<main class="container-rndb">
	<HistoryPaged
		{changes}
		{title}
		dbItem="book"
		prefix="b"
		currentPage={data.currentPage}
		totalPages={data.totalPages}
	/>
</main>
