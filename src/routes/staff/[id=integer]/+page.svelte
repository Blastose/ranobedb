<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Staff from '$lib/components/staff/id/Staff.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';
	import { getThemeContext } from '$lib/stores/themeStore.js';

	export let data;

	$: staff = data.staff;

	const displayPrefs = getDisplayPrefsContext();
	const theme = getThemeContext();
</script>

<PageTitle title={getNameDisplay({ obj: staff, prefs: $displayPrefs.names })} />

<DbRouteShell theme={$theme} bgImageStyle={null}>
	<Staff
		{staff}
		works={data.works}
		user={data.user}
		revision={undefined}
		currentPage={data.currentPage}
		totalPages={data.totalPages}
		results={data.count}
	/>
</DbRouteShell>
