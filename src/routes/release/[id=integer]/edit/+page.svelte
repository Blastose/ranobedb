<script lang="ts">
	import ReleaseForm from '$lib/components/form/release/ReleaseForm.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	let { data } = $props();

	let release = $derived(data.release);

	const diplayPrefs = getDisplayPrefsContext();
</script>

<PageTitle title="Editing {getNameDisplay({ obj: release, prefs: $diplayPrefs.names })}" />
<NoIndex />

<main class="container-rndb">
	<ReleaseForm releaseForm={data.form} {release} type="edit" user={data.user} />
</main>
