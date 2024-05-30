<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Publisher from '$lib/components/publisher/id/Publisher.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';
	import { getThemeContext } from '$lib/stores/themeStore.js';

	export let data;

	$: publisher = data.publisher;

	const theme = getThemeContext();
	const displayPrefs = getDisplayPrefsContext();
</script>

<PageTitle title={getNameDisplay({ obj: publisher, prefs: $displayPrefs.names })} />

<DbRouteShell theme={$theme} bgImageStyle={null}>
	<Publisher
		{publisher}
		works={data.works}
		isRevision={false}
		user={data.user}
		currentPage={data.currentPage}
		results={data.count}
		totalPages={data.totalPages}
	/>
</DbRouteShell>
