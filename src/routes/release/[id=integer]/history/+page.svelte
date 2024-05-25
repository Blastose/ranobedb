<script lang="ts">
	import History from '$lib/components/history/History.svelte';
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
	<History {changes} {title} dbItem="release" prefix="r" />
</main>
