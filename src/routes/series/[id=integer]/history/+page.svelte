<script lang="ts">
	import HistoryPaged from '$lib/components/history/HistoryPaged.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	export let data;

	$: changes = data.changes;
	$: series = data.series;

	const displayPrefs = getDisplayPrefsContext();

	$: title = `Edit history of ${getTitleDisplay({
		obj: series,
		prefs: $displayPrefs.title_prefs,
	})}`;
</script>

<PageTitle {title} />

<main class="container-rndb">
	<HistoryPaged
		{changes}
		{title}
		dbItem="series"
		prefix="s"
		currentPage={data.currentPage}
		totalPages={data.totalPages}
	/>
</main>
