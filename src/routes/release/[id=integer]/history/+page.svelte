<script lang="ts">
	import HistoryPaged from '$lib/components/history/HistoryPaged.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	export let data;

	$: changes = data.changes;
	$: release = data.release;

	const displayPrefs = getDisplayPrefsContext();

	$: title = `Edit history of ${getNameDisplay({ obj: release, prefs: $displayPrefs.names })}`;
</script>

<PageTitle {title} />

<main class="container-rndb">
	<HistoryPaged {changes} {title} currentPage={data.currentPage} totalPages={data.totalPages} />
</main>
