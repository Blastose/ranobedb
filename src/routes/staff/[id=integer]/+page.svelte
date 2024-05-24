<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Staff from '$lib/components/staff/id/Staff.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';
	import { themeStore } from '$lib/stores/themeStore.js';

	export let data;

	$: staff = data.staff;

	const displayPrefs = getDisplayPrefsContext();
</script>

<PageTitle title={getNameDisplay({ obj: staff, prefs: $displayPrefs.names })} />

<DbRouteShell theme={$themeStore ?? data.theme} imageBgStyle={null}>
	<Staff
		{staff}
		books={data.books}
		user={data.user}
		isRevision={false}
		currentPage={data.currentPage}
		totalPages={data.totalPages}
		results={data.count}
	/>
</DbRouteShell>
