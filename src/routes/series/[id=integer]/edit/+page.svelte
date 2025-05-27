<script lang="ts">
	import SeriesForm from '$lib/components/form/series/SeriesForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';

	let { data } = $props();

	let series = $derived(data.series);

	const displayPrefs = getDisplayPrefsContext();
</script>

<PageTitle title="Editing {getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs })}" />
<NoIndex />

<main class="container-rndb">
	<SeriesForm {series} seriesForm={data.form} type="edit" user={data.user} />
</main>
