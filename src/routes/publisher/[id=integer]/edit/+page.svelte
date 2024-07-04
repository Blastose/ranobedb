<script lang="ts">
	import PublisherForm from '$lib/components/form/publisher/PublisherForm.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	export let data;

	$: publisher = data.publisher;

	const diplayPrefs = getDisplayPrefsContext();
</script>

<PageTitle title="Editing {getNameDisplay({ obj: publisher, prefs: $diplayPrefs.names })}" />
<NoIndex />

<main class="container-rndb">
	<PublisherForm publisherForm={data.form} {publisher} type="edit" user={data.user} />
</main>
