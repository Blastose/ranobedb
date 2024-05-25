<script lang="ts">
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Release from '$lib/components/release/id/Release.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';
	import { getThemeContext } from '$lib/stores/themeStore.js';

	export let data;

	$: release = data.release;

	const theme = getThemeContext();
	const diplayPrefs = getDisplayPrefsContext();
</script>

<PageTitle title={getNameDisplay({ obj: release, prefs: $diplayPrefs.names })} />

<DbRouteShell theme={$theme} bgImageStyle={null}>
	<Release isRevision={false} {release} user={data.user} />
</DbRouteShell>
