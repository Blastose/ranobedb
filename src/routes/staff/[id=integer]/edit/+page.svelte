<script lang="ts">
	import StaffForm from '$lib/components/form/staff/StaffForm.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';

	let { data } = $props();

	let staff = $derived(data.staff);

	const diplayPrefs = getDisplayPrefsContext();
</script>

<PageTitle title="Editing {getNameDisplay({ obj: staff, prefs: $diplayPrefs.names })}" />
<NoIndex />

<main class="container-rndb">
	<StaffForm {staff} staffForm={data.form} type="edit" user={data.user} />
</main>
