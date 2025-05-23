<script lang="ts">
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Staff from '$lib/components/staff/id/Staff.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';
	import { getThemeContext } from '$lib/stores/themeStore.js';

	let { data } = $props();

	const displayPrefs = getDisplayPrefsContext();
	const theme = getThemeContext();

	let staff = $derived(data.staff);
	let title = $derived(getNameDisplay({ obj: staff, prefs: $displayPrefs.names }));
</script>

<PageTitle {title} />
<MetaTags {title} description={staff.description} site_name={'RanobeDB'} />

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
