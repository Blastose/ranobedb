<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book.js';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import DbRouteShell from '$lib/components/layout/db/DBRouteShell.svelte';
	import Release from '$lib/components/release/id/Release.svelte';
	import { getDisplayPrefsContext, getNameDisplay } from '$lib/display/prefs.js';
	import { getBgImageStyle, getThemeContext } from '$lib/stores/themeStore.js';

	export let data;

	$: release = data.release;

	const theme = getThemeContext();
	const diplayPrefs = getDisplayPrefsContext();

	$: firstBookInReleases = release.books.at(0);
	$: imageUrl = buildImageUrl(firstBookInReleases?.image?.filename);
	$: bgImageStyle = getBgImageStyle($theme, imageUrl);
</script>

<PageTitle title={getNameDisplay({ obj: release, prefs: $diplayPrefs.names })} />

<DbRouteShell theme={$theme} {bgImageStyle}>
	<Release revision={undefined} {release} user={data.user} />
</DbRouteShell>
