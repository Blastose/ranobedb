<script lang="ts">
	import HistoryPaged from '$lib/components/history/HistoryPaged.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	export let data;

	$: changes = data.changes;
	$: staff = data.staff;

	const displayPrefs = getDisplayPrefsContext();

	$: title = `Edit history of ${getNameDisplay({ obj: staff, prefs: $displayPrefs.names })}`;
</script>

<PageTitle {title} />

<main class="container-rndb">
	<HistoryPaged
		{changes}
		{title}
		dbItem="staff"
		prefix="st"
		currentPage={data.currentPage}
		totalPages={data.totalPages}
	/>
</main>
