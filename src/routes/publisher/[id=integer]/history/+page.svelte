<script lang="ts">
	import HistoryPaged from '$lib/components/history/HistoryPaged.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	let { data } = $props();

	let changes = $derived(data.changes);
	let publisher = $derived(data.publisher);

	const displayPrefs = getDisplayPrefsContext();

	let title = $derived(
		`Edit history of ${getNameDisplay({ obj: publisher, prefs: $displayPrefs.names })}`,
	);
</script>

<PageTitle {title} />
<NoIndex />

<main class="container-rndb">
	<HistoryPaged {changes} {title} currentPage={data.currentPage} totalPages={data.totalPages} />
</main>
