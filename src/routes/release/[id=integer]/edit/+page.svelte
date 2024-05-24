<script lang="ts">
	import ReleaseForm from '$lib/components/form/release/ReleaseForm.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	export let data;

	$: release = data.release;

	const diplayPrefs = getDisplayPrefsContext();
</script>

<PageTitle title="Editing {getNameDisplay({ obj: release, prefs: $diplayPrefs.names })}" />

<main class="container-rndb">
	<ReleaseForm releaseForm={data.form} {release} type="edit" user={data.user} />
</main>
