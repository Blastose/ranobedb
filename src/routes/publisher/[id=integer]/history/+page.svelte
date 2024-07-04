<script lang="ts">
	import HistoryPaged from '$lib/components/history/HistoryPaged.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	export let data;

	$: changes = data.changes;
	$: publisher = data.publisher;

	const displayPrefs = getDisplayPrefsContext();

	$: title = `Edit history of ${getNameDisplay({ obj: publisher, prefs: $displayPrefs.names })}`;
</script>

<PageTitle {title} />
<NoIndex />

<main class="container-rndb">
	<HistoryPaged {changes} {title} currentPage={data.currentPage} totalPages={data.totalPages} />
</main>
